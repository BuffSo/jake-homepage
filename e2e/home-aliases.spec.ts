import { readdirSync } from "node:fs";
import { expect, test, type Page } from "@playwright/test";
import { collectErrors } from "./helpers";

// 홈의 짧은 주소 열 개 (docs/superpowers/specs/2026-11-17-home-alias-paths-design.md, docs/02-ia.md 페이지).
// 열 개 모두 주소 그대로 홈과 같은 화면을 200으로 돌려주고, 대표 주소와 공유 정보는 홈의 것이다.
// 정하지 않은 주소는 지금처럼 404다. 화면 폭과 관계없는 값이라 데스크톱에서만 돌린다.

const SITE = "https://jakeso.dev";
const ALIASES = ["/about", "/intro", "/hello", "/me", "/profile", "/welcome", "/start", "/info", "/home", "/main"];
const BOT = "facebookexternalhit/1.1;kakaotalk-scrap/1.0";

// 모바일 프로젝트만 hasTouch가 켜져 있다 (playwright.config.ts).
test.skip(({ hasTouch }) => hasTouch, "화면 폭과 관계없는 값이다");

/** 홈과 같아야 하는 값: 브라우저 제목, 본문 글, JSON-LD, 대표 주소, 공유 주소와 그림 */
async function snapshot(page: Page): Promise<Record<string, string | null>> {
  const attr = (selector: string, name: string) => page.locator(selector).getAttribute(name);
  return {
    title: await page.title(),
    main: await page.locator("main").textContent(),
    jsonLd: await page.locator('script[type="application/ld+json"]').textContent(),
    canonical: await attr('link[rel="canonical"]', "href"),
    ogUrl: await attr('meta[property="og:url"]', "content"),
    ogImage: await attr('meta[property="og:image"]', "content"),
  };
}

test("짧은 주소 폴더가 정한 열 개와 같다", () => {
  const dirs = readdirSync("src/app/(home-aliases)", { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => `/${entry.name}`);
  expect(dirs.sort()).toEqual([...ALIASES].sort());
});

for (const path of ALIASES) {
  test(`${path}는 주소 그대로 홈과 같은 화면을 연다`, async ({ page }) => {
    await page.goto("/");
    const home = await snapshot(page);
    expect(home.canonical).toBe(SITE);
    expect(home.ogUrl).toBe(SITE);

    const errors = collectErrors(page);
    const response = await page.goto(path);
    expect(response?.status()).toBe(200);
    expect(new URL(page.url()).pathname).toBe(path);
    await page.waitForLoadState("networkidle");
    expect(errors).toEqual([]);

    expect(await snapshot(page)).toEqual(home);
    // 홈처럼 헤더 메뉴의 어느 항목에도 지금 페이지 표시가 없다.
    await expect(page.locator("header [aria-current]")).toHaveCount(0);
    // 다음 페이지는 포트폴리오다. 버튼은 끝까지 내려야 보인다(e2e/back-to-top.spec.ts).
    // 숨은 채로 includeHidden으로 찾으면 aria-hidden인 화살표까지 이름에 들어가 이름이 맞지 않는다.
    await page.evaluate(() => scrollTo(0, document.documentElement.scrollHeight));
    const next = page.getByRole("link", { name: "다음 페이지: 포트폴리오", exact: true });
    await expect(next).toBeVisible();
    await expect(next).toHaveAttribute("href", "/work");
  });
}

test("끝 슬래시와 쿼리가 붙어도 그 주소로 열린다", async ({ page }) => {
  const errors = collectErrors(page);
  for (const [url, path] of [
    ["/about/", "/about"],
    ["/about?stats=off", "/about"],
  ]) {
    const response = await page.goto(url);
    expect(response?.status()).toBe(200);
    expect(new URL(page.url()).pathname).toBe(path);
  }
  await page.waitForLoadState("networkidle");
  expect(errors).toEqual([]);
});

// 미리보기·검색 봇에게는 미리 만든 페이지 대신 요청마다 서버에서 새로 그린다. 그 렌더가 되는지 본다.
// Vercel에서만 나는 파일 추적 누락(검색과 공유 가이드의 봇에게만 500)은 로컬 next start로는 잡히지 않아, 배포 뒤 운영 주소로 본다.
test("미리보기 봇에게도 열 개 모두 200이고 대표 주소가 홈이다", async ({ request }) => {
  for (const path of ALIASES) {
    const response = await request.get(path, { headers: { "user-agent": BOT } });
    expect(response.status(), path).toBe(200);
    expect(await response.text(), path).toMatch(/<link rel="canonical" href="https:\/\/jakeso\.dev"\s*\/?>/);
  }
});

test("정하지 않은 주소는 404다", async ({ request }) => {
  for (const path of ["/abcd", "/About", "/about/more"]) {
    const response = await request.get(path);
    expect(response.status(), path).toBe(404);
  }
});

test("짧은 주소에서 메뉴로 옮겨 다닐 수 있다", async ({ page }) => {
  const errors = collectErrors(page);
  await page.goto("/about");
  const banner = page.getByRole("banner");
  const nav = page.getByRole("navigation", { name: "주요 메뉴" }).locator("visible=true");
  await nav.getByRole("link", { name: "Work" }).click();
  await expect(page).toHaveURL(/\/work$/);
  await expect(nav.getByRole("link", { name: "Work" })).toHaveAttribute("aria-current", "page");
  await banner.getByRole("link", { name: "Jake" }).click();
  await expect(page).toHaveURL((url) => url.pathname === "/");
  await page.waitForLoadState("networkidle");
  expect(errors).toEqual([]);
});
