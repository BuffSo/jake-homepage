import { PrintButton } from "./print-button";

// /resume 머리 (docs/02-ia.md /resume). 원문의 첫 두 줄(한 줄 소개, 이름)을 순서 그대로 쓰고, 이름이 페이지의 h1이다.
// 크기와 굵기는 이 페이지가 처음 전하는 말인 한 줄 소개에 두고, 이름은 서명처럼 또렷하되 작게 둔다(docs/03-design.md F4).
// 인쇄에서는 머리글과 버튼을 숨기고 한 줄 소개와 이름만 남긴다. 종이에는 사이트 헤더가 없어 이름이 유일한 표지라, 인쇄에서는 이름을 크게 둔다.
export function ResumeHead({
  label,
  tagline,
  name,
  print,
}: {
  label: string;
  tagline: string;
  name: string;
  print: string;
}) {
  return (
    <div className="flex flex-col gap-4 pb-6 lg:flex-row lg:items-end lg:justify-between lg:gap-8 lg:pb-10 print:pb-0">
      <div className="flex flex-col gap-2 lg:gap-3 print:gap-1">
        <span className="font-mono text-[0.6875rem] tracking-[0.04em] text-subtle lg:text-[0.8125rem] print:hidden">
          {label}
        </span>
        <p className="text-[1.25rem] font-bold leading-[1.4] tracking-[-0.015em] text-balance lg:text-[1.75rem] print:text-[0.8125rem] print:font-normal print:leading-[1.6] print:tracking-normal print:text-muted">
          {tagline}
        </p>
        <h1 className="text-[1.125rem] font-semibold lg:text-[1.25rem] print:text-[1.75rem] print:font-extrabold print:tracking-[-0.025em]">
          {name}
        </h1>
      </div>
      <div>
        <PrintButton>{print}</PrintButton>
      </div>
    </div>
  );
}
