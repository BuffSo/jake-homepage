import type { Page } from "@playwright/test";

/** 콘솔 오류, 페이지 오류, 실패한 요청을 모은다 */
export function collectErrors(page: Page) {
  const errors: string[] = [];
  page.on("console", (msg) => {
    // 응답 실패는 아래 response에서 주소와 함께 따로 본다.
    if (msg.type() === "error" && !msg.text().startsWith("Failed to load resource")) errors.push(msg.text());
  });
  page.on("pageerror", (err) => errors.push(err.message));
  page.on("response", (res) => {
    if (res.status() >= 400) errors.push(`${res.status()} ${new URL(res.url()).pathname}`);
  });
  return errors;
}
