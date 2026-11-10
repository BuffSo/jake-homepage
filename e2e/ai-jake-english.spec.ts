import { readFileSync } from "node:fs";
import { expect, test } from "@playwright/test";
import { parseFrontmatter } from "../src/lib/frontmatter.mjs";
import { capturePath, collectErrors } from "./helpers";

// Jake English 소개 화면 확인 (docs/02-ia.md /ai/jake-english). 캡처는 test-results/에만 남고 커밋하지 않는다.
// 기대값은 사이트 전용 글(content/site/jake-english.md)에서 읽는다. 문구가 바뀌어도 테스트는 그대로다.

const je = parseFrontmatter(readFileSync("content/site/jake-english.md", "utf8"), "jake-english.md").data as {
  title: string;
  subtitle: string;
  video: { href: string; caption: string };
  story: { caption: string }[];
  panels: { caption: string }[];
  chapters: { title: string; body: string; metric?: { value: string; label: string } }[];
};

const PATH = "/ai/jake-english";

test("페이지가 열리고 콘솔 오류와 실패한 요청이 없다", async ({ page }) => {
  const errors = collectErrors(page);
  const response = await page.goto(PATH);
  expect(response?.status()).toBe(200);
  await page.waitForLoadState("networkidle");
  expect(errors).toEqual([]);
});

test("브라우저 제목, 머리글, 제목, 부제가 글과 같다", async ({ page }) => {
  await page.goto(PATH);
  await expect(page).toHaveTitle(`${je.title} · 소재희`);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(je.title);
  await expect(page.locator("main").getByText("AI / APP", { exact: true })).toBeVisible();
  await expect(page.locator("main").getByText(je.subtitle, { exact: true })).toBeVisible();
});

test("영상 썸네일과 아래 한 줄이 유튜브로 가는 링크 하나다", async ({ page }) => {
  await page.goto(PATH);
  const link = page.locator("main").getByRole("link", { name: je.video.caption });
  await expect(link).toHaveCount(1);
  await expect(link).toHaveAttribute("href", je.video.href);
  await expect(link).toHaveAttribute("target", "_blank");
  await expect(link.locator("img")).toHaveCount(1);
});

test("이야기 4컷은 네 칸이고, 칸마다 번호와 설명이 있고, 연습 흐름보다 앞이다", async ({ page }) => {
  await page.goto(PATH);
  const story = page.getByRole("region", { name: "이야기 4컷" });
  const items = story.getByRole("listitem");
  await expect(items).toHaveCount(4);
  for (const [i, panel] of je.story.entries()) {
    await expect(items.nth(i).locator("figcaption")).toHaveText(`${i + 1}${panel.caption}`);
    const box = await items.nth(i).locator("img").boundingBox();
    expect(Math.abs(box!.width / box!.height - 1)).toBeLessThan(0.02);
  }
  const order = await page.evaluate(() => {
    const a = document.querySelector('[aria-labelledby="story-title"]');
    const b = document.querySelector('[aria-labelledby="flow-title"]');
    return Boolean(a && b && a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING);
  });
  expect(order).toBe(true);
});

test("연습 흐름은 네 칸이고, 칸마다 번호와 설명이 있다", async ({ page }) => {
  await page.goto(PATH);
  const items = page.getByRole("region", { name: "연습 흐름" }).getByRole("listitem");
  await expect(items).toHaveCount(4);
  for (const [i, panel] of je.panels.entries()) {
    await expect(items.nth(i).locator("figcaption")).toHaveText(`${i + 1}${panel.caption}`);
  }
});

test("본문 다섯 장은 순서대로 머리글, 소제목, 문단이고, 1~4장은 그림, 5장은 숫자다", async ({ page }) => {
  await page.goto(PATH);
  for (const [i, chapter] of je.chapters.entries()) {
    const section = page.getByRole("region", { name: chapter.title });
    await expect(section.getByText(`${i + 1} / ${je.chapters.length}`, { exact: true })).toBeVisible();
    await expect(section.getByRole("heading", { level: 2 })).toHaveText(chapter.title);
    await expect(section.locator("p").last()).toHaveText(chapter.body);
    if (chapter.metric) {
      await expect(section.locator("img")).toHaveCount(0);
      await expect(section.getByText(chapter.metric.value, { exact: true })).toBeVisible();
      await expect(section.getByText(chapter.metric.label, { exact: true })).toBeVisible();
    } else {
      await expect(section.locator("img")).toHaveCount(1);
    }
  }
});

test("끝 링크는 영상 보기와 AI로 일하는 방식이다", async ({ page }) => {
  await page.goto(PATH);
  const main = page.locator("main");
  await expect(main.getByRole("link", { name: "영상 보기" })).toHaveAttribute("href", je.video.href);
  await expect(main.getByRole("link", { name: "AI로 일하는 방식" })).toHaveCount(2);
  await main.getByRole("link", { name: "AI로 일하는 방식" }).first().click();
  await expect(page).toHaveURL(/\/ai$/);
});

test("가로 스크롤이 생기지 않는다 (지금 폭과 320)", async ({ page }) => {
  const overflow = () =>
    page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  await page.goto(PATH);
  expect(await overflow()).toBeLessThanOrEqual(0);
  await page.setViewportSize({ width: 320, height: 800 });
  for (const path of [PATH, "/ai"]) {
    await page.goto(path);
    expect(await overflow()).toBeLessThanOrEqual(0);
  }
});

test("그림을 모두 불러온다", async ({ page }) => {
  await page.goto(PATH);
  const images = page.locator("main img");
  await expect(images).toHaveCount(13);
  for (let i = 0; i < 13; i++) {
    const image = images.nth(i);
    await image.scrollIntoViewIfNeeded();
    await expect.poll(() => image.evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth > 0)).toBe(true);
  }
});

test("캡처를 남긴다 (라이트, 다크)", async ({ page }) => {
  for (const scheme of ["light", "dark"] as const) {
    await page.emulateMedia({ colorScheme: scheme });
    await page.goto(PATH);
    for (const image of await page.locator("main img").all()) await image.scrollIntoViewIfNeeded();
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.screenshot({ path: capturePath(page, `ai-jake-english-${scheme}`), fullPage: true });
  }
});
