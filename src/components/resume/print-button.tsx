"use client";

import { buttonClass } from "../button-link";

// 이력서 인쇄 버튼 (docs/02-ia.md /resume 인쇄). 브라우저 인쇄 창만 연다. PDF로 저장도 그 창에서 한다.
// 인쇄한 종이에는 나오지 않는다.
export function PrintButton({ children }: { children: string }) {
  return (
    <button type="button" onClick={() => window.print()} className={buttonClass("outline", "cursor-pointer print:hidden")}>
      {children}
    </button>
  );
}
