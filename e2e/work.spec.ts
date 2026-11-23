import { readdirSync, readFileSync } from "node:fs";
import { expect, test } from "@playwright/test";
import { parseFrontmatter } from "../src/lib/frontmatter.mjs";
import { composeChapters } from "../src/lib/portfolio.mjs";
import { capturePath, collectErrors } from "./helpers";

// 포트폴리오 화면 확인 (ADR-0008, docs/02-ia.md /work). 캡처는 test-results/에만 남고 커밋하지 않는다.
// 기대값은 사이트 전용 글과, 포트폴리오 원문으로 만든 챕터에서 읽는다.

type Project = { slug: string; order: number; title: string; liveUrl: string; liveLabel?: string; imageAlt: string };
type Site = {
  slug: string;
  order: number;
  title: string;
  liveUrl?: string;
  closed?: string;
  notes?: { label: string; text: string }[];
  imageAlt: string;
  stack: string[];
  wide?: boolean;
};
type Chapter = {
  slug: string;
  head: { name: string; links: { url: string; label: string | null }[]; lead: string; stack: string[] };
  after: { id: string; title: string } | null;
};
type Work = { title: string; sites: { title: string }; chapters: { slug: string; imageAlt?: string }[] };

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
// 서비스 글(content/site/projects/)이 없는 챕터(Jake English)는 work.md의 챕터 설정에서 읽는다. 페이지와 같은 규칙이다.
const projectOf = (slug: string) => projects.find((p) => p.slug === slug);
const imageAltOf = (slug: string) => projectOf(slug)?.imageAlt ?? work.chapters.find((c) => c.slug === slug)!.imageAlt!;

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

test("챕터마다 원문의 이름, 첫 줄, 화면, 링크 버튼, 보시는 방법, 뒤에 붙는 절이 있다", async ({ page }) => {
  await page.goto("/work");
  expect(chapters.map((c) => c.slug)).toEqual(["recueve", "prowith", "lotto-ai", "jake-english"]);
  for (const chapter of chapters) {
    const section = page.getByRole("region", { name: chapter.head.name, exact: true });
    await expect(section).toHaveAttribute("id", chapter.slug);
    // 첫 줄은 원문 인용이고, ProWith는 한눈에 보기 표의 문장이다(work.md의 lead).
    await expect(section.getByText(chapter.head.lead, { exact: true })).toBeVisible();
    await expect(section.getByRole("img", { name: imageAltOf(chapter.slug), exact: true })).toBeVisible();
    // 버튼은 원문 주소 줄의 주소마다 하나다. 이름이 없는 주소는 "서비스 열기"(ProWith는 "데모 열기")다.
    for (const link of chapter.head.links) {
      const label = link.label ?? projectOf(chapter.slug)?.liveLabel ?? "서비스 열기";
      // 보시는 방법의 글에도 같은 이름의 링크가 있을 수 있어(Jake English의 소개 영상) 버튼만 본다
      const button = section.locator("a.rounded-full").filter({ hasText: new RegExp(`^${label}`) });
      await expect(button).toHaveCount(1);
      await expect(button).toHaveAttribute("href", link.url);
      await expect(button).toHaveAttribute("target", "_blank");
    }
    await expect(section.getByText("보시는 방법", { exact: true })).toBeVisible();
    if (chapter.after) {
      // /ai의 짧은 카드가 /work#prowith-ai, /work#recueve-ai로 이 제목을 가리킨다
      const heading = section.getByRole("heading", { level: 3, name: chapter.after.title, exact: true });
      await expect(heading).toBeVisible();
      await expect(heading).toHaveAttribute("id", chapter.after.id);
    }
  }
  expect(chapters.map((c) => c.after?.id ?? null)).toEqual(["recueve-ai", "prowith-ai", "lotto-ai-performance", null]);
});

test("Jake English 챕터는 소개 영상과 공개 저장소 버튼을 둔다", async ({ page }) => {
  await page.goto("/work#jake-english");
  const section = page.getByRole("region", { name: "Jake English", exact: true });
  await expect(section.getByText("04 / 04 · JAKE ENGLISH")).toBeVisible();
  const buttons = section.locator("a.rounded-full");
  await expect(buttons).toHaveCount(2);
  await expect(buttons.nth(0)).toHaveText(/^소개 영상/);
  await expect(buttons.nth(0)).toHaveAttribute("href", /youtu\.be\/SrAWg5lS0lQ$/);
  await expect(buttons.nth(1)).toHaveText(/^공개 저장소/);
  await expect(buttons.nth(1)).toHaveAttribute("href", "https://github.com/BuffSo/jake-english");
});

test("사이트에서 고친 문장이 보이고, 원문 이미지와 인쇄용 규칙은 싣지 않는다", async ({ page }) => {
  await page.goto("/work");
  const main = page.getByRole("main");
  await expect(main.getByText("잡았습니다(아래 성능 개선)", { exact: false })).toBeVisible();
  await expect(main).not.toContainText("앞의 하네스가");
  await expect(main).not.toContainText("(5-1)");
  await expect(main.locator('img[src*="assets/"]')).toHaveCount(0);
  await expect(main.locator("style")).toHaveCount(0);
});

test("그림은 다섯 장이고, 좁은 화면에서는 상자 안에서만 옆으로 넘긴다", async ({ page }, testInfo) => {
  await page.goto("/work");
  const figures = page.locator("main .md-figure");
  await expect(figures).toHaveCount(5);
  await expect(page.getByRole("region", { name: "Recueve 구성도", exact: true })).toBeVisible();
  await expect(page.getByRole("region", { name: "Jake English 구성도", exact: true })).toBeVisible();
  for (let i = 0; i < 5; i++) {
    const figure = figures.nth(i);
    await expect(figure.locator("svg")).toHaveCount(1);
    await expect(figure).toHaveAttribute("tabindex", "0");
    const scrolls = await figure.evaluate((el) => el.scrollWidth > el.clientWidth);
    expect(scrolls).toBe(testInfo.project.name === "mobile");
  }
  // 설명 줄은 넘기지 않고 화면 폭 안에 둔다
  const captions = page.locator("main .fig sub");
  await expect(captions).toHaveCount(5);
  const viewport = page.viewportSize()!.width;
  for (let i = 0; i < 5; i++) {
    const box = (await captions.nth(i).boundingBox())!;
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(viewport);
  }
});

test("사이트에만 남긴 상세가 보이고, 첫 칸이 문장인 표는 첫 칸도 줄을 바꾼다", async ({ page }) => {
  await page.goto("/work");
  for (const slug of ["recueve", "prowith"]) {
    const heading = page.locator(`#${slug}`).getByRole("heading", { level: 3, name: "기술적 결정", exact: true });
    await expect(heading).toBeVisible();
  }
  const lotto = page.locator("#lotto-ai");
  await expect(lotto.getByRole("heading", { level: 3, name: "로그는 NoSQL인 MongoDB에 분리해서 저장했습니다" })).toBeVisible();
  await expect(lotto.getByRole("heading", { level: 3, name: "개발 모드에서 등급별 계정을 선택해 바로 테스트하게 했습니다" })).toBeVisible();
  const tables = page.locator("main .md-table.md-long-first");
  await expect(tables).toHaveCount(2);
  await expect(tables.first().locator("td").first()).toHaveCSS("white-space", "normal");
});

test("보시는 방법은 한눈에 보기 표의 안내를 그대로 그린다", async ({ page }) => {
  await page.goto("/work");
  // 원문 칸의 <code>와 링크가 그대로 보인다
  await expect(page.locator("#prowith .md-note code").filter({ hasText: "DEMO Login" })).toHaveCount(1);
  await expect(page.locator("#jake-english .md-note").getByRole("link", { name: /소개 영상/ })).toHaveAttribute("target", "_blank");
});

test("의뢰받아 만든 작업 카드는 사이트 링크가 있거나 없는 이유를 쓰고, 소스 링크는 없다", async ({ page }) => {
  await page.goto("/work");
  const section = page.getByRole("region", { name: work.sites.title });
  const cards = section.getByRole("article");
  await expect(cards).toHaveCount(sites.length);
  for (const [i, site] of sites.entries()) {
    const card = cards.nth(i);
    await expect(card.getByRole("heading", { level: 3 })).toHaveText(site.title);
    await expect(card.getByRole("img", { name: site.imageAlt })).toBeVisible();
    if (site.liveUrl) {
      await expect(card.getByRole("link", { name: /사이트 열기/ })).toHaveAttribute("href", site.liveUrl);
    } else {
      await expect(card.getByRole("link")).toHaveCount(0);
      await expect(card.getByText(site.closed!)).toBeVisible();
    }
  }
  await expect(section.getByRole("link", { name: /소스 보기/ })).toHaveCount(0);
});

test("넓은 카드는 기술 설명 줄을 보여 주고, 데스크톱에서만 다른 카드보다 넓다", async ({ page }) => {
  await page.goto("/work");
  const guide = sites.find((s) => s.wide)!;
  const cards = page.getByRole("region", { name: work.sites.title }).getByRole("article");
  const card = cards.filter({ has: page.getByRole("heading", { name: guide.title }) });
  for (const note of guide.notes!) await expect(card.getByText(note.text)).toBeVisible();

  const width = async (locator: typeof card) => (await locator.boundingBox())!.width;
  const [wide, other] = [await width(card), await width(cards.first())];
  if (page.viewportSize()!.width >= 1024) expect(wide).toBeGreaterThan(other * 1.5);
  else expect(wide).toBe(other);
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
