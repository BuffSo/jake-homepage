import Link from "next/link";
import { buttonClass } from "@/components/button-link";
import type { AiCase } from "@/lib/content";
import { Eyebrow } from "./ai-text";
import { CasePanel } from "./case-panel";

// /ai 맨 위의 AI 도구 활용 사례 입구 (docs/02-ia.md /ai, docs/03-design.md AI 사례).
// 머리 소개 아래, 목차 위에 둔다. 띠 전체가 /ai/case 링크이고, 링크 이름은 aria-label로 짧게 준다.
// 버튼 이름은 다른 상세 링크(홈 AI 카드, 짧은 카드)와 같은 "자세히 보기"다. 4컷 요약은 띠의 작은 그림이 이미 보여 준다.
// 작은 그림 네 칸은 데스크톱에서 오른쪽 한 줄, 모바일에서 버튼 아래 한 줄이다.
export function CaseEntry({ aiCase }: { aiCase: AiCase }) {
  return (
    <Link
      href="/ai/case"
      aria-label={`${aiCase.title} 자세히 보기`}
      className="group mb-6 grid gap-4 rounded-[0.625rem] border border-line p-[1.125rem] lg:mb-10 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center lg:gap-8 lg:rounded-xl lg:px-7 lg:py-6"
    >
      <div className="flex flex-col items-start gap-2">
        <Eyebrow text={`CASE · ${aiCase.subtitle}`} />
        <span className="text-[1.1875rem] font-bold lg:text-[1.375rem]">{aiCase.title}</span>
        <span className={buttonClass("outline", "group-hover:border-fg")}>
          자세히 보기<span aria-hidden="true">→</span>
        </span>
      </div>
      <div className="grid grid-cols-4 gap-1.5 lg:grid-cols-[repeat(4,7rem)] lg:gap-2">
        {aiCase.panels.map((panel) => (
          <CasePanel
            key={panel.caption}
            crop={panel.crop}
            sizes="(min-width: 64rem) 16rem, 57vw"
            className="rounded-md border border-line-soft"
          />
        ))}
      </div>
    </Link>
  );
}
