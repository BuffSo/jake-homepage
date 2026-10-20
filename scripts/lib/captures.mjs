// 주요 화면 캡처의 목록 (docs/01-prd.md F6)
// e2e/*.spec.ts의 "캡처를 남긴다" 테스트가 찍고(e2e/helpers.ts capturePath), scripts/check-captures.mjs가 모두 생겼는지 본다.
// 픽셀 비교는 하지 않는다.

export const CAPTURE_DIR = "test-results/captures";

const PAGES = ["home", "work", "ai", "ai-case", "resume"];
const THEMES = ["light", "dark"];
// playwright.config.ts의 desktop, mobile 프로젝트 폭
const WIDTHS = [1280, 375];

/** 생겨야 할 캡처 파일 이름. 페이지마다 라이트와 다크, 이력서는 인쇄 화면도 찍는다. */
export function expectedCaptures() {
  const names = [...PAGES.flatMap((page) => THEMES.map((theme) => `${page}-${theme}`)), "resume-print"];
  return WIDTHS.flatMap((width) => names.map((name) => `${name}-${width}.png`));
}

/** 폴더에 있는 파일 이름을 받아, 빠진 캡처를 돌려준다 */
export function missingCaptures(files) {
  const have = new Set(files);
  return expectedCaptures().filter((file) => !have.has(file));
}
