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

/**
 * 주요 화면 캡처의 경로 (docs/01-prd.md F6): test-results/captures/<이름>-<폭>.png
 * 테스트마다 다른 출력 폴더 대신 한 폴더에 모은다. npm run verify 뒤에 바로 열어 보고, CI는 artifact로 올린다.
 */
export function capturePath(page: Page, name: string) {
  return `test-results/captures/${name}-${page.viewportSize()?.width}.png`;
}
