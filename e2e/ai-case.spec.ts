import { readFileSync } from "node:fs";
import { expect, test } from "@playwright/test";
import { parseAiCase } from "../src/lib/ai-case.mjs";
import { capturePath, collectErrors } from "./helpers";

// AI 도구 활용 사례 화면 확인 (ADR-0008, docs/02-ia.md /ai/case). 캡처는 test-results/에만 남고 커밋하지 않는다.
// 기대값은 동기화한 사례 파일(content/synced/ai-case.*)에서 읽는다. 원본 문장이 바뀌어도 테스트는 그대로다.

const aiCase = parseAiCase(
  readFileSync("content/synced/ai-case.json", "utf8"),
  readFileSync("content/synced/ai-case.txt", "utf8"),
);

test("사례 페이지가 열리고 콘솔 오류와 실패한 요청이 없다", async ({ page }) => {
  const errors = collectErrors(page);
  const response = await page.goto("/ai/case");
  expect(response?.status()).toBe(200);
  await page.waitForLoadState("networkidle");
  expect(errors).toEqual([]);
});

test("브라우저 제목, 페이지 제목, 부제가 사례 파일과 같다", async ({ page }) => {
  await page.goto("/ai/case");
  await expect(page).toHaveTitle(`${aiCase.title} · 소재희`);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(aiCase.title);
  await expect(page.locator("main").getByText(aiCase.subtitle, { exact: true })).toBeVisible();
  // 부제에는 작성자 이름을 싣지 않는다 (동기화 규칙)
  expect(aiCase.subtitle).not.toContain("|");
});

test("4컷은 순서대로 네 칸이고, 칸마다 번호와 설명이 있다", async ({ page }) => {
  await page.goto("/ai/case");
  const items = page.getByRole("list", { name: "4컷" }).getByRole("listitem");
  await expect(items).toHaveCount(4);
  for (const [i, panel] of aiCase.panels.entries()) {
    const caption = items.nth(i).locator("figcaption");
    await expect(caption).toHaveText(`${i + 1}${panel.caption}`);
  }
});

test("본문은 소제목과 원본 문단 그대로다", async ({ page }) => {
  await page.goto("/ai/case");
  const body = page.getByRole("region", { name: aiCase.heading });
  await expect(body.getByRole("heading", { level: 2 })).toHaveText(aiCase.heading);
  await expect(body.locator("p")).toHaveText(aiCase.body);
});

test("돌아가기 링크와 끝 링크가 /ai와 /work 원문으로 간다", async ({ page }) => {
  await page.goto("/ai/case");
  const main = page.locator("main");
  await expect(main.getByRole("link", { name: "포트폴리오 원문 보기" })).toHaveAttribute("href", "/work#prowith-ai");
  await expect(main.getByRole("link", { name: "AI로 일하는 방식" })).toHaveCount(2);
  await main.getByRole("link", { name: "AI로 일하는 방식" }).first().click();
  await expect(page).toHaveURL(/\/ai$/);
});

test("가로 스크롤이 생기지 않는다", async ({ page }) => {
  await page.goto("/ai/case");
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(0);
});

test("4컷 그림을 불러오고, 칸 상자가 정사각에 가깝다", async ({ page }) => {
  await page.goto("/ai/case");
  const images = page.locator("main figure img");
  await expect(images).toHaveCount(4);
  for (let i = 0; i < 4; i++) {
    const image = images.nth(i);
    await image.scrollIntoViewIfNeeded();
    await expect.poll(() => image.evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth > 0)).toBe(true);
    // 그림은 칸보다 크고, 칸 상자가 넘치는 부분을 잘라 낸다
    const box = await image.evaluate((el) => {
      const frame = el.parentElement!.getBoundingClientRect();
      return { ratio: frame.width / frame.height, overflow: getComputedStyle(el.parentElement!).overflow };
    });
    expect(box.overflow).toBe("hidden");
    expect(Math.abs(box.ratio - 1)).toBeLessThan(0.02);
  }
});

test("캡처를 남긴다 (라이트, 다크)", async ({ page }) => {
  for (const scheme of ["light", "dark"] as const) {
    await page.emulateMedia({ colorScheme: scheme });
    await page.goto("/ai/case");
    // 칸 그림은 한 장을 같이 쓰므로, 아래 칸까지 불러온 뒤 찍는다.
    for (const image of await page.locator("main img").all()) await image.scrollIntoViewIfNeeded();
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.screenshot({ path: capturePath(page, `ai-case-${scheme}`), fullPage: true });
  }
});
