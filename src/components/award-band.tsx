import { ButtonLink } from "@/components/button-link";

// 대회 결과 띠 (docs/03-design.md "홈 AI 섹션 띠에서 정한 값"). 홈 AI 섹션과 /resume 머리 아래에서 같은 문구와 링크로 쓴다.
// 왼쪽에 두 줄, 오른쪽에 바깥 링크 버튼 하나. 글이 버튼과 한 줄에 들지 않으면 버튼이 다음 줄로 내려가 오른쪽에 붙는다.
// badge를 주면 첫 줄 앞에 뱃지를 단다(/resume의 NEW). 새 색 없이 강조색 바탕에 강조 위 글자색이다(docs/03-design.md 색).
export function AwardBand({
  title,
  detail,
  cta,
  href,
  badge,
  className = "",
}: {
  title: string;
  detail: string;
  cta: string;
  href: string;
  badge?: string;
  className?: string;
}) {
  return (
    <div
      role="note"
      aria-label={title}
      className={`flex flex-wrap items-center gap-x-4 gap-y-3 rounded-[0.625rem] border border-line px-[1.125rem] py-4 lg:rounded-xl lg:px-6 ${className}`}
    >
      <div className="flex flex-col gap-1">
        <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-lg leading-[1.4] font-bold">
          {badge && (
            <span className="inline-flex h-5 items-center rounded-full bg-accent px-2 font-mono text-[0.625rem] leading-none font-medium tracking-[0.04em] text-on-accent">
              {badge}
            </span>
          )}
          <span>{title}</span>
        </p>
        <p className="text-xs leading-[1.6] text-subtle">{detail}</p>
      </div>
      <ButtonLink href={href} className="ml-auto">
        {cta}
      </ButtonLink>
    </div>
  );
}
