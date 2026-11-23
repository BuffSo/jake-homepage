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
        {/* 뱃지는 글줄 안에 둔다. 제목이 길어 꺾여도 뱃지가 첫 줄 앞에 남고, 제목은 뱃지 바로 뒤에서 이어진다.
            꺾일 때 "상위 / 5% 성적"처럼 끝 낱말만 넘어가지 않게 줄 길이를 고르게 나눈다(text-balance) */}
        <p className="text-lg leading-[1.4] font-bold text-balance">
          {badge && (
            <span className="mr-2 inline-flex h-5 items-center rounded-full bg-accent px-2 align-middle font-mono text-[0.625rem] leading-none font-medium tracking-[0.04em] text-on-accent">
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
