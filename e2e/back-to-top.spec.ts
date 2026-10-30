import { expect, test, type Page } from "@playwright/test";

// 맨 위로 가기 버튼과 다음 페이지 버튼 확인 (docs/02-ia.md 공통 요소). 네 페이지에서 본다.
// target은 버튼이 보이는 기준이자 누른 뒤 초점이 가는 곳이다. 홈은 첫 화면, 나머지는 목차다.
// next는 헤더 순서의 다음 페이지 버튼이다. 마지막 페이지(이력서)는 처음(홈)으로 돌아가는 "처음으로"다.
// next.name은 화면 읽기 프로그램이 읽는 이름이다.

const PAGES = [
  { path: "/", target: "hero", name: "첫 화면", subject: "첫 화면이", next: { name: "다음 페이지: 포트폴리오", href: "/work" } },
  { path: "/work", target: "page-index", name: "목차", subject: "목차가", next: { name: "다음 페이지: AI로 일하는 방식", href: "/ai" } },
  { path: "/ai", target: "page-index", name: "목차", subject: "목차가", next: { name: "다음 페이지: 이력서", href: "/resume" } },
  { path: "/resume", target: "page-index", name: "목차", subject: "목차가", next: { name: "처음으로 (홈)", href: "/" } },
];

const button = (page: Page) => page.getByRole("button", { name: "맨 위로" });
const endLink = (page: Page, name: string) => page.getByRole("link", { name, exact: true });

/** target이 화면 위로 다 사라질 만큼 내린다 */
async function scrollPast(page: Page, target: string) {
  await page.evaluate((id) => {
    const element = document.getElementById(id)!;
    scrollTo(0, element.getBoundingClientRect().bottom + scrollY + innerHeight);
  }, target);
}

for (const { path, target, name, subject, next } of PAGES) {
  test(`${path}: ${subject} 보이는 동안은 숨고, 화면 위로 사라지면 보인다`, async ({ page }) => {
    await page.goto(path);
    await expect(button(page)).toBeHidden();
    await scrollPast(page, target);
    await expect(button(page)).toBeVisible();
  });

  test(`${path}: 누르면 맨 위로 가고 ${name}에 초점을 두며, 버튼은 다시 숨는다`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto(path);
    await scrollPast(page, target);
    await button(page).click();
    // 움직임 줄이기면 부드럽게 스크롤하지 않고 바로 맨 위에 있다
    expect(await page.evaluate(() => scrollY)).toBe(0);
    await expect(page.locator(`#${target}`)).toBeFocused();
    await expect(button(page)).toBeHidden();
  });

  test(`${path}: 페이지 끝에서 푸터를 가리지 않는다`, async ({ page }) => {
    await page.goto(path);
    await page.evaluate(() => scrollTo(0, document.documentElement.scrollHeight));
    await expect(button(page)).toBeVisible();
    const box = (await button(page).boundingBox())!;
    const footer = (await page.locator("body > footer").boundingBox())!;
    expect(box.y + box.height).toBeLessThanOrEqual(footer.y);
  });

  test(`${path}: "${next.name}" 버튼은 끝까지 내렸을 때만 맨 위로 왼쪽에 보인다`, async ({ page }) => {
    const link = endLink(page, next.name);
    await page.goto(path);
    await expect(link).toBeHidden();
    // 길잡이를 지난 중간에서는 맨 위로만 보인다
    await scrollPast(page, target);
    await expect(button(page)).toBeVisible();
    await expect(link).toBeHidden();
    await page.evaluate(() => scrollTo(0, document.documentElement.scrollHeight));
    await expect(link).toBeVisible();
    await expect(link).toHaveAttribute("href", next.href);
    const box = (await link.boundingBox())!;
    const top = (await button(page).boundingBox())!;
    const footer = (await page.locator("body > footer").boundingBox())!;
    expect(box.x + box.width).toBeLessThanOrEqual(top.x);
    expect(box.y + box.height).toBeLessThanOrEqual(footer.y);
  });
}

test("다음 페이지 버튼을 누르면 그 페이지로 간다", async ({ page }) => {
  await page.goto("/work");
  await page.evaluate(() => scrollTo(0, document.documentElement.scrollHeight));
  await endLink(page, "다음 페이지: AI로 일하는 방식").click();
  await expect(page).toHaveURL(/\/ai$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("AI로 일하는 방식");
});

test("이력서 끝의 처음으로를 누르면 홈으로 간다", async ({ page }) => {
  await page.goto("/resume");
  await page.evaluate(() => scrollTo(0, document.documentElement.scrollHeight));
  await endLink(page, "처음으로 (홈)").click();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.locator("#hero")).toBeVisible();
});

test("움직임 줄이기가 아니어도 맨 위까지 올라간다", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/work");
  await scrollPast(page, "page-index");
  await button(page).click();
  // 부드럽게 올라가므로 누른 바로 뒤에는 아직 맨 위가 아니다
  expect(await page.evaluate(() => scrollY)).toBeGreaterThan(0);
  await expect.poll(() => page.evaluate(() => scrollY)).toBe(0);
  await expect(button(page)).toBeHidden();
});

test("낮은 창에서 목차가 첫 화면 아래에 있어도, 바로 맨 위로 뛰면 다시 숨는다", async ({ page }) => {
  // 가로로 돌린 휴대폰처럼 창이 낮으면 맨 위에서 목차가 화면 아래에 있다.
  // 움직임 줄이기로 바로 뛰면 목차가 화면 위에서 아래로 화면을 거치지 않고 건너간다.
  await page.setViewportSize({ width: page.viewportSize()!.width, height: 240 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/work");
  expect((await page.locator("#page-index").boundingBox())!.y).toBeGreaterThan(240);
  await expect(button(page)).toBeHidden();
  await scrollPast(page, "page-index");
  await expect(button(page)).toBeVisible();
  await button(page).click();
  expect(await page.evaluate(() => scrollY)).toBe(0);
  await expect(button(page)).toBeHidden();
});

test("화면만 바뀌는 이동으로 페이지 중간에 오면 바로 보인다", async ({ page }) => {
  await page.goto("/ai");
  await page.locator('main a[href^="/work#"]').first().click();
  await expect(page).toHaveURL(/\/work#/);
  await expect(button(page)).toBeVisible();
});

test("이력서를 인쇄하면 나오지 않는다", async ({ page }) => {
  await page.goto("/resume");
  await scrollPast(page, "page-index");
  await expect(button(page)).toBeVisible();
  await page.emulateMedia({ media: "print" });
  await expect(button(page)).toBeHidden();
});
