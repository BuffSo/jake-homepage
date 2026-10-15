import type { Page } from "@playwright/test";

// 아직 만들지 않은 페이지와 그 아래 주소(/ai/jake-wiki 등). 링크를 미리 받다가 404가 난다. F3~F4에서 페이지가 생기면 지운다.
export const PENDING_ROUTES = ["/ai", "/resume"];
const isPending = (pathname: string) => PENDING_ROUTES.some((r) => pathname === r || pathname.startsWith(`${r}/`));

/** 콘솔 오류, 페이지 오류, 실패한 요청(아직 없는 페이지 제외)을 모은다 */
export function collectErrors(page: Page) {
  const errors: string[] = [];
  page.on("console", (msg) => {
    // 응답 실패는 아래 response에서 주소와 함께 따로 본다.
    if (msg.type() === "error" && !msg.text().startsWith("Failed to load resource")) errors.push(msg.text());
  });
  page.on("pageerror", (err) => errors.push(err.message));
  page.on("response", (res) => {
    const { pathname } = new URL(res.url());
    if (res.status() >= 400 && !isPending(pathname)) errors.push(`${res.status()} ${pathname}`);
  });
  return errors;
}
