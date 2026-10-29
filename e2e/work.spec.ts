import { readdirSync, readFileSync } from "node:fs";
import { expect, test } from "@playwright/test";
import { parseFrontmatter } from "../src/lib/frontmatter.mjs";
import { composeChapters } from "../src/lib/portfolio.mjs";
import { capturePath, collectErrors } from "./helpers";

// 포트폴리오 화면 확인 (ADR-0008, docs/02-ia.md /work). 캡처는 test-results/에만 남고 커밋하지 않는다.
// 기대값은 사이트 전용 글과, 포트폴리오 원문으로 만든 챕터에서 읽는다.

type Project = { slug: string; order: number; title: string; liveUrl: string; liveLabel?: string; imageAlt: string };
type Site = { slug: string; order: number; title: string; liveUrl: string; sourceUrl: string; imageAlt: string; stack: string[] };
type Chapter = { slug: string; head: { name: string; url: string; lead: string; stack: string[] }; ai: { title: string } | null };
type Work = { title: string; sites: { title: string }; chapters: unknown[] };

const read = (file: string) => parseFrontmatter(readFileSync(file, "utf8"), file).data;
const readDir = <T extends { order: number }>(dir: string) =>
  readdirSync(dir)
    .filter((f) => f.endsWith(".md"))
    .map((f) => read(`${dir}/${f}`) as T)
    .sort((a, b) => a.order - b.order);
const work = read("content/site/work.md") as Work;
const projects = readDir<Project>("content/site/projects");
const sites = readDir<Site>("content/site/sites");
const chapters = composeChapters(readFileSync("content/synced/portfolio.md", "utf8"), work.chapters) as Chapter[];
const projectOf = (slug: string) => projects.find((p) => p.slug === slug)!;

test("포트폴리오가 열리고 콘솔 오류와 실패한 요청이 없다", async ({ page }) => {
  const errors = collectErrors(page);
  const response = await page.goto("/work");
  expect(response?.status()).toBe(200);
  await page.waitForLoadState("networkidle");
  expect(errors).toEqual([]);
});

test("브라우저 제목과 페이지 제목이 있다", async ({ page }) => {
  await page.goto("/work");
  await expect(page).toHaveTitle(`${work.title} · 소재희`);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(work.title);
});

test("가로 스크롤이 생기지 않고, 넓은 표는 상자 안에서만 넘긴다", async ({ page }, testInfo) => {
  await page.goto("/work");
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(0);
  if (testInfo.project.name === "mobile") {
    const table = page.getByRole("region", { name: "표" }).first();
    const scrolls = await table.evaluate((el) => el.scrollWidth > el.clientWidth);
    expect(scrolls).toBe(true);
  }
});

test("목차의 링크가 해당 절로 간다", async ({ page }) => {
  await page.goto("/work");
  const links = page.getByRole("navigation", { name: "이 페이지의 목차" }).getByRole("link");
  await expect(links).toHaveCount(chapters.length + 1);
  const targets = [...chapters.map((c) => ({ id: c.slug, name: c.head.name })), { id: "sites", name: work.sites.title }];
  for (const [i, target] of targets.entries()) {
    await links.nth(i).click();
    await expect(page).toHaveURL(new RegExp(`#${target.id}$`));
    await expect(page.getByRole("heading", { level: 2, name: target.name, exact: true })).toBeInViewport();
  }
});

test("홈 카드의 자세히 보기가 해당 챕터로 간다", async ({ page }) => {
  for (const project of projects) {
    await page.goto("/");
    await page.locator(`article#${project.slug}`).getByRole("link", { name: "자세히 보기" }).click();
    await expect(page).toHaveURL(new RegExp(`/work#${project.slug}$`));
    await expect(page.getByRole("heading", { level: 2, name: project.title, exact: true })).toBeInViewport();
  }
});

test("챕터마다 원문의 이름, 첫 줄, 화면, 서비스 링크, 보시는 방법, AI 절이 있다", async ({ page }) => {
  await page.goto("/work");
  for (const chapter of chapters) {
    const project = projectOf(chapter.slug);
    const section = page.getByRole("region", { name: chapter.head.name, exact: true });
    await expect(section).toHaveAttribute("id", chapter.slug);
    // 첫 줄은 원문 인용이고, ProWith는 work.md 규칙으로 홈 소개와 같은 문장이다.
    await expect(section.getByText(chapter.head.lead, { exact: true })).toBeVisible();
    await expect(section.getByRole("img", { name: project.imageAlt })).toBeVisible();
    const live = section.getByRole("link", { name: new RegExp(project.liveLabel ?? "서비스 열기") });
    await expect(live).toHaveAttribute("href", chapter.head.url);
    await expect(live).toHaveAttribute("target", "_blank");
    await expect(section.getByText("보시는 방법", { exact: true })).toBeVisible();
    if (chapter.ai) {
      // /ai의 짧은 카드가 /work#slug-ai로 이 제목을 가리킨다
      const aiHeading = section.getByRole("heading", { level: 3, name: chapter.ai.title, exact: true });
      await expect(aiHeading).toBeVisible();
      await expect(aiHeading).toHaveAttribute("id", `${chapter.slug}-ai`);
    }
  }
});

test("사이트에서 고친 문장이 보이고, 원문 이미지는 싣지 않는다", async ({ page }) => {
  await page.goto("/work");
  const main = page.getByRole("main");
  await expect(main.getByText("아래 AI 활용 - 제품 참조", { exact: false })).toBeVisible();
  await expect(main).not.toContainText("앞의 하네스가");
  await expect(main).not.toContainText("3절 참조");
  await expect(main.locator('img[src*="assets/"]')).toHaveCount(0);
});

test("보시는 방법의 굵게 표시가 한글 조사 앞에서도 닫힌다", async ({ page }) => {
  await page.goto("/work");
  // 원문: **`로그인` → `DEMO Login`**에서 (닫는 ** 뒤에 조사가 붙는다)
  const note = page.locator("#prowith .md-note");
  await expect(note.locator("strong").filter({ hasText: "DEMO Login" })).toHaveCount(1);
});

test("의뢰받아 만든 사이트 카드에 사이트 링크와 소스 링크가 있다", async ({ page }) => {
  await page.goto("/work");
  const section = page.getByRole("region", { name: work.sites.title });
  const cards = section.getByRole("article");
  await expect(cards).toHaveCount(sites.length);
  for (const [i, site] of sites.entries()) {
    const card = cards.nth(i);
    await expect(card.getByRole("heading", { level: 3 })).toHaveText(site.title);
    await expect(card.getByRole("img", { name: site.imageAlt })).toBeVisible();
    await expect(card.getByRole("link", { name: /사이트 열기/ })).toHaveAttribute("href", site.liveUrl);
    await expect(card.getByRole("link", { name: /소스 보기/ })).toHaveAttribute("href", site.sourceUrl);
  }
});

test("첫 챕터 캡처만 바로 불러오고, 나머지 캡처는 내려올 때 불러온다", async ({ page }) => {
  await page.goto("/work");
  // 첫 챕터 캡처는 모바일 첫 화면의 LCP 요소다 (Lighthouse 모바일 성능 90점 기준)
  for (const [i, chapter] of chapters.entries()) {
    const image = page.locator(`#${chapter.slug} img`).first();
    await expect(image).toHaveAttribute("loading", i === 0 ? "eager" : "lazy");
    await expect(image).toHaveAttribute("fetchpriority", i === 0 ? "high" : "auto");
  }
});

test("이미지마다 대체 텍스트가 있고, 내려오면 불러온다", async ({ page }) => {
  await page.goto("/work");
  const images = page.locator("main img");
  const count = await images.count();
  expect(count).toBe(chapters.length + sites.length);
  for (let i = 0; i < count; i++) {
    const image = images.nth(i);
    await expect(image).toHaveAttribute("alt", /\S/);
    await image.scrollIntoViewIfNeeded();
    await expect.poll(() => image.evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth > 0)).toBe(true);
  }
});

test("스택 칩은 아는 이름 앞에 단색 로고를 넣는다", async ({ page }) => {
  // StackChips (docs/03-design.md F2). 칩 이름은 챕터 원문과 사이트 글의 스택 그대로이고, 로고는 aria-hidden이다.
  await page.goto("/work");
  const lists = page.locator('ul[aria-label="스택"]');
  const stacks = [...chapters.map((c) => c.head.stack), ...sites.map((s) => s.stack)];
  await expect(lists).toHaveCount(stacks.length);
  for (const [i, names] of stacks.entries()) {
    await expect(lists.nth(i).getByRole("listitem")).toHaveText(names);
  }
  const logos = lists.locator("svg");
  expect(await logos.count()).toBeGreaterThan(0);
  expect(await logos.evaluateAll((els) => els.every((el) => el.getAttribute("aria-hidden") === "true"))).toBe(true);
  // 버전이 붙은 이름도 로고를 찾고, 그림이 없는 이름(AWS)은 글자만 둔다
  const chip = (name: string) => lists.getByRole("listitem").filter({ hasText: new RegExp(`^${name}$`) }).first();
  await expect(chip("Next\\.js 16").locator("svg")).toHaveCount(1);
  await expect(chip("AWS").locator("svg")).toHaveCount(0);
});

test("캡처를 남긴다 (라이트, 다크)", async ({ page }) => {
  for (const scheme of ["light", "dark"] as const) {
    await page.emulateMedia({ colorScheme: scheme });
    await page.goto("/work");
    await page.screenshot({ path: capturePath(page, `work-${scheme}`), fullPage: true });
  }
});
