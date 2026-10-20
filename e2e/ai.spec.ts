import { readdirSync, readFileSync } from "node:fs";
import { expect, test } from "@playwright/test";
import { parseFrontmatter } from "../src/lib/frontmatter.mjs";
import { capturePath, collectErrors } from "./helpers";

// AI로 일하는 방식 화면 확인 (ADR-0008, docs/02-ia.md /ai). 캡처는 test-results/에만 남고 커밋하지 않는다.
// 기대값은 사이트 전용 글(content/site/)에서 읽는다.

type AiWork = {
  slug: string;
  order: number;
  group: string;
  home?: number;
  title: string;
  result?: string;
  usage?: string;
  links: { label: string; href: string }[];
  more?: string;
};

const read = (file: string) => parseFrontmatter(readFileSync(file, "utf8"), file).data;
const head = (read("content/site/home.md") as { sections: { ai: { title: string } } }).sections.ai;
const groups = (read("content/site/ai-page.md") as { groups: { id: string; title: string }[] }).groups;
const works = readdirSync("content/site/ai")
  .filter((f) => f.endsWith(".md"))
  .map((f) => read(`content/site/ai/${f}`) as AiWork)
  .sort((a, b) => a.order - b.order);
const details = works.filter((w) => !w.more);
const shorts = works.filter((w) => w.more);

test("AI 페이지가 열리고 콘솔 오류와 실패한 요청이 없다", async ({ page }) => {
  const errors = collectErrors(page);
  const response = await page.goto("/ai");
  expect(response?.status()).toBe(200);
  await page.waitForLoadState("networkidle");
  expect(errors).toEqual([]);
});

test("브라우저 제목과 페이지 제목이 있다", async ({ page }) => {
  await page.goto("/ai");
  await expect(page).toHaveTitle(`${head.title} · 소재희`);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(head.title);
});

test("가로 스크롤이 생기지 않는다", async ({ page }) => {
  await page.goto("/ai");
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(0);
});

test("목차의 묶음과 항목 링크가 해당 절로 간다", async ({ page }) => {
  await page.goto("/ai");
  const nav = page.getByRole("navigation", { name: "이 페이지의 목차" });
  await expect(nav.getByRole("link")).toHaveCount(groups.length + works.length);
  for (const group of groups) {
    await nav.getByRole("link", { name: group.title, exact: true }).click();
    await expect(page).toHaveURL(new RegExp(`#${group.id}$`));
    await expect(page.getByRole("heading", { level: 2, name: group.title, exact: true })).toBeInViewport();
  }
  for (const work of works) {
    await nav.getByRole("link", { name: work.title, exact: true }).click();
    await expect(page).toHaveURL(new RegExp(`#${work.slug}$`));
    await expect(page.getByRole("heading", { level: 3, name: work.title, exact: true })).toBeInViewport();
  }
});

test("홈 AI 카드의 자세히 보기가 해당 항목으로 간다", async ({ page }) => {
  const homeWorks = works.filter((w) => w.home !== undefined).sort((a, b) => a.home! - b.home!);
  for (const [i, work] of homeWorks.entries()) {
    await page.goto("/");
    const card = page.getByRole("region", { name: head.title }).getByRole("article").nth(i);
    await card.getByRole("link", { name: "자세히 보기" }).click();
    await expect(page).toHaveURL(new RegExp(`/ai#${work.slug}$`));
    await expect(page.getByRole("heading", { level: 3, name: work.title, exact: true })).toBeInViewport();
  }
});

test("상세 항목에 문제, 만든 것, 결과 또는 쓰는 법과 링크가 있다", async ({ page }) => {
  await page.goto("/ai");
  for (const work of details) {
    const item = page.locator(`article#${work.slug}`);
    const terms = item.locator("dt");
    await expect(terms).toHaveText(["문제", "만든 것", work.usage ? "쓰는 법" : "결과"]);
    // 개인 도구는 결과 대신 쓰는 법을 쓴다
    if (work.group === "personal") await expect(terms.last()).toHaveText("쓰는 법");
    for (const link of work.links) {
      const anchor = item.getByRole("link", { name: new RegExp(link.label) });
      await expect(anchor).toHaveAttribute("href", link.href);
      await expect(anchor).toHaveAttribute("target", "_blank");
    }
  }
});

test("짧은 카드는 /work의 AI 절로 보낸다", async ({ page }) => {
  for (const work of shorts) {
    await page.goto("/ai");
    const link = page.locator(`article#${work.slug}`).getByRole("link", { name: "자세히 보기" });
    await expect(link).toHaveAttribute("href", work.more!);
    await link.click();
    await expect(page).toHaveURL(new RegExp(`${work.more}$`));
    await expect(page.locator(work.more!.slice(work.more!.indexOf("#")))).toBeInViewport();
  }
});

test("머리 아래, 목차 위의 사례 입구가 /ai/case로 간다", async ({ page }) => {
  await page.goto("/ai");
  const entry = page.getByRole("link", { name: "AI 도구 활용 사례 자세히 보기" });
  await expect(entry).toHaveAttribute("href", "/ai/case");
  // 입구는 목차보다 앞에 있다
  const order = await entry.evaluate((el) => {
    const nav = document.getElementById("page-index")!;
    return el.compareDocumentPosition(nav) & Node.DOCUMENT_POSITION_FOLLOWING;
  });
  expect(order).toBeTruthy();
  // 작은 그림 네 칸은 장식이라 대체 텍스트를 비운다. 링크 이름이 뜻을 말한다.
  await expect(entry.locator("img")).toHaveCount(4);
  for (const image of await entry.locator("img").all()) await expect(image).toHaveAttribute("alt", "");
  await entry.click();
  await expect(page).toHaveURL(/\/ai\/case$/);
});

test("이미지마다 대체 텍스트가 있고, 내려오면 불러온다", async ({ page }) => {
  await page.goto("/ai");
  // 사례 입구의 장식 그림은 위 테스트에서 따로 본다.
  const images = page.locator('main img:not(a[href="/ai/case"] img)');
  const count = await images.count();
  expect(count).toBeGreaterThan(0);
  for (let i = 0; i < count; i++) {
    const image = images.nth(i);
    await expect(image).toHaveAttribute("alt", /\S/);
    await image.scrollIntoViewIfNeeded();
    await expect.poll(() => image.evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth > 0)).toBe(true);
  }
});

test("캡처를 남긴다 (라이트, 다크)", async ({ page }) => {
  for (const scheme of ["light", "dark"] as const) {
    await page.emulateMedia({ colorScheme: scheme });
    await page.goto("/ai");
    await page.screenshot({ path: capturePath(page, `ai-${scheme}`), fullPage: true });
  }
});
