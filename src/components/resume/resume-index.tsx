import type { ResumePage } from "@/lib/content";

// /resume 목차 (docs/02-ia.md /resume). 원문의 절 열 개다. 화면에 고정하지 않고, 인쇄에서는 숨긴다.
// 목차가 화면 위로 사라지면 맨 위로 버튼이 보이고, 누르면 목차에 초점이 온다(back-to-top.tsx).
// 모바일은 두 칸 다섯 줄, 데스크톱은 다섯 칸 두 줄이다. 선은 /ai 목차와 같다(위 선만 fg, 칸 사이는 line-soft).

/** 칸의 선과 왼쪽 여백. 모바일과 데스크톱의 줄 바뀜이 달라 칸마다 따로 정한다. */
function cellClass(i: number) {
  const mobileLeft = i % 2 === 1;
  const desktopLeft = i % 5 !== 0;
  return [
    "border-line-soft",
    i >= 2 && "border-t",
    i >= 2 && i < 5 && "lg:border-t-0",
    mobileLeft && "border-l pl-3",
    desktopLeft && !mobileLeft && "lg:border-l",
    !desktopLeft && mobileLeft && "lg:border-l-0 lg:pl-0",
    desktopLeft && "lg:pl-5",
  ]
    .filter(Boolean)
    .join(" ");
}

export function ResumeIndex({ sections }: { sections: ResumePage["sections"] }) {
  return (
    <nav id="page-index" tabIndex={-1} aria-label="이력서 목차" className="border-t border-b border-t-fg border-b-line print:hidden">
      <ol className="grid grid-cols-2 lg:grid-cols-5">
        {sections.map((section, i) => (
          <li key={section.id} className={cellClass(i)}>
            <a
              href={`#${section.id}`}
              className="flex min-h-11 items-center gap-2.5 py-2.5 hover:text-accent lg:flex-col lg:items-start lg:gap-1.5 lg:pt-4 lg:pr-5 lg:pb-[1.125rem]"
            >
              <span className="font-mono text-[0.6875rem] text-subtle lg:text-xs">{String(i + 1).padStart(2, "0")}</span>
              <span className="text-[0.9375rem] font-bold lg:text-[1.0625rem]">{section.title}</span>
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
