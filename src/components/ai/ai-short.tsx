import { ButtonLink } from "@/components/button-link";
import { Metric } from "@/components/section-head";
import type { AiWork } from "@/lib/content";
import { Eyebrow, Facts } from "./ai-text";

// /ai의 짧은 카드 (docs/02-ia.md /ai). 원문이 /work에 있는 항목이라 한 줄씩만 쓰고 그 절로 보낸다.
// 같은 글을 두 페이지에 싣지 않는다.
export function AiShort({ work }: { work: AiWork }) {
  const titleId = `${work.slug}-title`;
  return (
    <article
      id={work.slug}
      aria-labelledby={titleId}
      className="mt-10 grid scroll-mt-4 grid-cols-1 gap-4 rounded-[0.625rem] border border-line p-[1.125rem] lg:mt-14 lg:grid-cols-[minmax(0,1fr)_13.75rem] lg:items-end lg:gap-8 lg:rounded-xl lg:px-7 lg:py-6"
    >
      <div className="flex flex-col gap-2.5">
        <Eyebrow text={work.eyebrow} />
        <h3 id={titleId} className="text-[1.1875rem] font-bold lg:text-[1.375rem]">
          {work.title}
        </h3>
        <Facts work={work} />
      </div>
      <div className="flex flex-col items-start gap-3.5">
        <div className="w-full">
          <Metric {...work.metric} />
        </div>
        <ButtonLink href={work.more!}>자세히 보기</ButtonLink>
      </div>
    </article>
  );
}
