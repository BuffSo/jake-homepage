import type { ReactNode } from "react";
import Link from "next/link";
import { buttonClass } from "@/components/button-link";
import { Eyebrow } from "./ai-text";

// /ai 맨 위의 입구 띠 (docs/02-ia.md /ai, docs/03-design.md AI 사례). AI 도구 활용 사례와 Jake English가 같이 쓴다.
// 머리 소개 아래, 목차 위에 두 띠를 나란히 둔다. 같은 컴포넌트로 만들어 두 입구의 무게를 맞춘다.
// 띠 전체가 링크이고, 링크 이름은 aria-label로 짧게 준다.
// 버튼 이름은 다른 상세 링크(홈 AI 카드, 짧은 카드)와 같은 "자세히 보기"다.
// 칸이 좁아져 글 아래 한 줄로 쌓는다. 작은 그림 줄은 mt-auto로 아래에 붙여, 제목이 두 줄인 이웃 띠와 그림 줄 높이를 맞춘다.
export function AiEntry({
  href,
  eyebrow,
  title,
  children,
}: {
  href: string;
  eyebrow: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-label={`${title} 자세히 보기`}
      className="group flex flex-col gap-4 rounded-[0.625rem] border border-line p-[1.125rem] lg:gap-8 lg:rounded-xl lg:px-7 lg:py-6"
    >
      <div className="flex flex-col items-start gap-2">
        <Eyebrow text={eyebrow} />
        <span className="text-[1.1875rem] font-bold lg:text-[1.375rem]">{title}</span>
        <span className={buttonClass("outline", "group-hover:border-fg")}>
          자세히 보기<span aria-hidden="true">→</span>
        </span>
      </div>
      <div className="mt-auto grid grid-cols-4 gap-1.5 lg:gap-2">{children}</div>
    </Link>
  );
}
