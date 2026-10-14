import { expect, test, type Page } from "@playwright/test";

// 홈 화면 확인 (ADR-0008). 캡처는 test-results/에만 남고 커밋하지 않는다.

// 아직 만들지 않은 페이지. 헤더 링크를 미리 받다가 404가 난다. F2~F4에서 페이지가 생기면 지운다.
const PENDING_ROUTES = ["/work", "/ai", "/resume"];

function collectErrors(page: Page) {
  const errors: string[] = [];
  page.on("console", (msg) => {
    // 응답 실패는 아래 response에서 주소와 함께 따로 본다.
    if (msg.type() === "error" && !msg.text().startsWith("Failed to load resource")) errors.push(msg.text());
  });
  page.on("pageerror", (err) => errors.push(err.message));
  page.on("response", (res) => {
    const { pathname } = new URL(res.url());
    if (res.status() >= 400 && !PENDING_ROUTES.includes(pathname)) errors.push(`${res.status()} ${pathname}`);
  });
  return errors;
}

test("홈이 열리고 콘솔 오류와 실패한 요청이 없다", async ({ page }) => {
  const errors = collectErrors(page);
  const response = await page.goto("/");
  expect(response?.status()).toBe(200);
  await page.waitForLoadState("networkidle");
  expect(errors).toEqual([]);
});

test("문서 언어는 한국어이고, 첫 줄만 영어로 표시한다", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("lang", "ko");
  await expect(page.getByRole("heading", { level: 1 })).toHaveAttribute("lang", "en");
});

test("가로 스크롤이 생기지 않는다", async ({ page }) => {
  await page.goto("/");
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(0);
});

test("헤더에서 Work, AI, Resume로 갈 수 있다", async ({ page }, testInfo) => {
  await page.goto("/");
  if (testInfo.project.name === "mobile") await page.getByText("메뉴").click();
  const nav = page.getByRole("navigation", { name: "주요 메뉴" }).locator("visible=true");
  await expect(nav.getByRole("link", { name: "Work" })).toHaveAttribute("href", "/work");
  await expect(nav.getByRole("link", { name: "AI" })).toHaveAttribute("href", "/ai");
  await expect(nav.getByRole("link", { name: "Resume" })).toHaveAttribute("href", "/resume");
});

test("다크 모드에서는 어두운 바탕을 쓴다", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "dark" });
  await page.goto("/");
  const background = await page.evaluate(() => getComputedStyle(document.documentElement).backgroundColor);
  expect(background).toBe("rgb(15, 16, 17)");
});

test("캡처를 남긴다 (라이트, 다크)", async ({ page }, testInfo) => {
  for (const scheme of ["light", "dark"] as const) {
    await page.emulateMedia({ colorScheme: scheme });
    await page.goto("/");
    await page.screenshot({ path: testInfo.outputPath(`home-${scheme}.png`), fullPage: true });
  }
});
