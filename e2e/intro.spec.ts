import { readFileSync } from "node:fs";
import { expect, test, type Page } from "@playwright/test";
import { parseFrontmatter } from "../src/lib/frontmatter.mjs";

// 첫 화면 움직임 (docs/04-motion.md). 다른 테스트는 움직임 줄이기로 마지막 장면만 보고, 여기서만 움직임을 켠다.

const PLAYED_KEY = "hero-intro-played";
const home = parseFrontmatter(readFileSync("content/site/home.md", "utf8"), "home.md").data as { lines: string[] };

declare global {
  interface Window {
    __intro: { start?: number; end?: number };
  }
}

/** data-intro가 playing이 된 시각과 사라진 시각을 페이지 안에서 잰다. */
async function recordIntro(page: Page) {
  await page.addInitScript(() => {
    window.__intro = {};
    new MutationObserver(() => {
      const hero = document.querySelector<HTMLElement>("[data-hero]");
      if (!hero) return;
      if (hero.dataset.intro === "playing" && window.__intro.start === undefined) window.__intro.start = performance.now();
      if (window.__intro.start !== undefined && hero.dataset.intro === undefined) window.__intro.end ??= performance.now();
    }).observe(document, { subtree: true, childList: true, attributes: true, attributeFilter: ["data-intro"] });
  });
}

const hero = (page: Page) => page.locator("[data-hero]");
// 첫 줄의 마지막 낱말. 재생하는 동안은 글자색이고, 마지막 박자에 그라데이션 사본이 왼쪽부터 덮는다.
const fillWord = (page: Page) => page.locator("[data-intro-fill]");

test.describe("움직임을 켠 경우", () => {
  test.use({ reducedMotion: "no-preference" });

  test("처음 방문하면 정해진 시간 안에 재생을 마치고 마지막 장면을 남긴다", async ({ page }, testInfo) => {
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(err.message));
    // 응답 실패는 home.spec.ts가 주소와 함께 따로 본다(e2e/helpers.ts collectErrors).
    page.on("console", (msg) => {
      if (msg.type() === "error" && !msg.text().startsWith("Failed to load resource")) errors.push(msg.text());
    });
    await recordIntro(page);

    await page.goto("/");
    await expect(hero(page)).not.toHaveAttribute("data-intro", { timeout: 6000 });
    const { start, end } = await page.evaluate(() => window.__intro);
    expect(start, "재생이 시작되지 않았습니다").toBeDefined();
    // 기준은 데스크톱 3초, 모바일 2.5초다 (docs/04-motion.md 박자).
    const limit = testInfo.project.name === "mobile" ? 2500 : 3000;
    expect(end! - start!).toBeLessThanOrEqual(limit);

    for (const line of home.lines) await expect(page.getByText(line)).toBeVisible();
    await expect(page.getByRole("button", { name: "다시 보기" })).toBeVisible();
    expect(await page.evaluate((key) => sessionStorage.getItem(key), PLAYED_KEY)).toBe("1");
    expect(errors).toEqual([]);
  });

  test("재생하는 동안 첫 줄 마지막 낱말은 글자색이고, 끝나면 그라데이션이 차 있고 사본이 남지 않는다", async ({ page }) => {
    await page.goto("/");
    await expect(hero(page)).toHaveAttribute("data-intro", "playing");
    await expect(fillWord(page)).toHaveCSS("background-image", "none");
    await expect(hero(page)).not.toHaveAttribute("data-intro", { timeout: 6000 });
    await expect(fillWord(page)).toHaveCSS("background-image", /linear-gradient/);
    await expect(fillWord(page).locator("[aria-hidden]")).toHaveCount(0);
  });

  test("같은 방문에서 다시 열면 재생하지 않는다", async ({ page }) => {
    await page.goto("/");
    await expect(hero(page)).not.toHaveAttribute("data-intro", { timeout: 6000 });
    await page.reload({ waitUntil: "domcontentloaded" });
    expect(await hero(page).evaluate((el) => el.hasAttribute("data-intro"))).toBe(false);
  });

  test("다시 보기를 누르면 처음부터 다시 재생한다", async ({ page }) => {
    await page.goto("/");
    await expect(hero(page)).not.toHaveAttribute("data-intro", { timeout: 6000 });
    await page.getByRole("button", { name: "다시 보기" }).click();
    await expect(hero(page)).toHaveAttribute("data-intro", "playing");
    await expect(hero(page)).not.toHaveAttribute("data-intro", { timeout: 6000 });
    await expect(page.getByText(home.lines[0])).toBeVisible();
  });

  test("JS가 재생을 시작하지 못하면 3초 뒤 마지막 장면을 보여 준다", async ({ page }) => {
    // CSS는 같은 폴더에 있으므로 JS만 막는다. 마지막 장면의 모양(첫 줄 그라데이션)까지 보기 위해서다.
    await page.route("**/_next/static/chunks/**/*.js", (route) => route.abort());
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await expect(hero(page)).toHaveAttribute("data-intro", "pending");
    await expect(hero(page)).not.toHaveAttribute("data-intro", { timeout: 5000 });
    await expect(page.getByText(home.lines[0])).toBeVisible();
    await expect(fillWord(page)).toHaveCSS("background-image", /linear-gradient/);
  });
});

test("움직임 줄이기면 재생하지 않고 다시 보기도 감춘다", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  expect(await hero(page).evaluate((el) => el.hasAttribute("data-intro"))).toBe(false);
  await expect(page.getByText(home.lines[0])).toBeVisible();
  await expect(page.getByRole("button", { name: "다시 보기" })).toBeHidden();
  // 첫 줄의 색은 처음부터 차 있다
  await expect(fillWord(page)).toHaveCSS("background-image", /linear-gradient/);
});
