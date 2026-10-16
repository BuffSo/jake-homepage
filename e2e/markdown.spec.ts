import { expect, test } from "@playwright/test";

// 원문 마크다운의 강조 기호가 화면에 그대로 남지 않는지 확인한다 (ADR-0009).
// 한국어는 닫는 **가 조사 앞에 붙어 CommonMark에서 풀리지 않기 쉽다. remark-cjk-friendly가 이를 막는다.

for (const path of ["/", "/work", "/ai", "/resume"]) {
  test(`${path}의 글에 강조 기호(**)가 남지 않는다`, async ({ page }) => {
    await page.goto(path);
    expect(await page.locator("body").innerText()).not.toContain("**");
  });
}
