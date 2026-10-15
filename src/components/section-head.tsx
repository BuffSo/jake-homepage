// 섹션 머리: 영문 머리글, 제목, 소개 한 줄 (docs/02-ia.md 홈 2~4, /work)
// 페이지의 첫 머리는 as="h1"로 쓴다.
export function SectionHead({
  id,
  label,
  title,
  intro,
  as: Heading = "h2",
}: {
  id: string;
  label: string;
  title: string;
  intro?: string;
  as?: "h1" | "h2";
}) {
  return (
    <div className="flex flex-col gap-2 pb-6 lg:gap-3 lg:pb-10">
      <span className="font-mono text-[0.6875rem] tracking-[0.04em] text-subtle lg:text-[0.8125rem]">{label}</span>
      <Heading id={id} className="text-[1.75rem] font-extrabold tracking-[-0.025em] lg:text-[2.5rem]">
        {title}
      </Heading>
      {intro && <p className="text-[0.9375rem] leading-[1.6] text-muted lg:text-[1.0625rem]">{intro}</p>}
    </div>
  );
}

/** 카드 아래쪽의 숫자 하나와 그 설명 */
export function Metric({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col gap-0.5 border-t border-line-soft pt-2.5 lg:pt-3">
      <span className="text-lg font-bold lg:text-xl">{value}</span>
      <span className="text-xs text-subtle">{label}</span>
    </div>
  );
}
