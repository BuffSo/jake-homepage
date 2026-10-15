import { PrintButton } from "./print-button";

// /resume 머리 (docs/02-ia.md /resume). 원문의 첫 두 줄(한 줄 소개, 이름)을 순서 그대로 쓰고, 이름이 페이지의 h1이다.
// 글자 크기는 SectionHead와 같다. 인쇄에서는 머리글과 버튼을 숨기고 한 줄 소개와 이름만 남긴다.
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
        <p className="text-[0.9375rem] leading-[1.6] text-muted lg:text-[1.0625rem] print:text-[0.8125rem]">{tagline}</p>
        <h1 className="text-[1.75rem] font-extrabold tracking-[-0.025em] lg:text-[2.5rem]">{name}</h1>
      </div>
      <div>
        <PrintButton>{print}</PrintButton>
      </div>
    </div>
  );
}
