// 페이지 순서 (docs/02-ia.md 공통 요소). 헤더 메뉴와 페이지 끝의 다음 페이지 버튼이 같은 목록을 쓴다.
// 홈은 헤더에서 별칭 "Jake" 링크라 목록에 없고, 순서의 맨 앞이다.
// note는 모바일 메뉴에서 이름 옆에 보이는 페이지 제목이다. 각 페이지의 브라우저 제목 앞부분과 같아야 한다(e2e/home.spec.ts가 확인).
export const NAV = [
  { label: "Work", href: "/work", note: "포트폴리오" },
  { label: "AI", href: "/ai", note: "AI로 일하는 방식" },
  { label: "Resume", href: "/resume", note: "이력서" },
];

/** 순서에서 다음 페이지. 홈 다음은 첫 메뉴이고, 마지막 페이지(이력서) 다음은 처음(홈)이다. */
export function nextPage(href: string) {
  const next = NAV[NAV.findIndex((item) => item.href === href) + 1];
  return next ? { href: next.href, title: next.note } : { href: "/", title: "처음으로", restart: true };
}
