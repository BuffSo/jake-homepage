import Image from "next/image";
import video from "@/assets/home/video.jpg";
import {
  HermesFlow,
  ITEM_FRAME,
  ITEM_FRAME_STEPS,
  McpFlow,
  ReviewFlow,
  SiteSteps,
  WikiFlow,
  WorkbenchFlow,
} from "@/components/ai-figures";
import { ButtonLink } from "@/components/button-link";
import { Metric } from "@/components/section-head";
import type { AiWork } from "@/lib/content";
import { Eyebrow, Facts } from "./ai-text";

// /ai의 상세 항목 (docs/02-ia.md /ai). 데스크톱은 글 왼쪽, 그림 오른쪽 두 칸이고 모바일은 이름 다음에 그림을 둔다.
// id는 slug다. 홈 AI 카드의 "자세히 보기"(/ai#slug)가 이곳을 가리킨다.

function Figure({ work }: { work: AiWork }) {
  switch (work.figure) {
    case "wiki-flow":
      return <WikiFlow className={ITEM_FRAME} />;
    case "hermes-flow":
      return <HermesFlow className={ITEM_FRAME} />;
    case "review-flow":
      return <ReviewFlow className={ITEM_FRAME} />;
    case "mcp-flow":
      return <McpFlow className={ITEM_FRAME} />;
    case "workbench-flow":
      return <WorkbenchFlow className={ITEM_FRAME} />;
    case "site-steps":
      return <SiteSteps className={ITEM_FRAME_STEPS} />;
    case "image":
      return (
        <Image
          src={video}
          alt={work.imageAlt ?? ""}
          sizes="(min-width: 80rem) 35rem, (min-width: 64rem) 45vw, 100vw"
          className="h-[12.5rem] w-full rounded-[0.625rem] border border-line object-cover lg:h-80 lg:rounded-xl"
        />
      );
    default:
      return null;
  }
}

export function AiItem({ work, first }: { work: AiWork; first: boolean }) {
  const titleId = `${work.slug}-title`;
  return (
    <article
      id={work.slug}
      aria-labelledby={titleId}
      className={`grid scroll-mt-4 grid-cols-1 gap-3 pt-10 lg:grid-cols-2 lg:grid-rows-[auto_1fr] lg:gap-x-12 lg:gap-y-3.5 lg:pt-14 ${
        first ? "" : "mt-10 border-t border-line-soft lg:mt-14"
      }`}
    >
      <div className="flex flex-col gap-2 lg:col-start-1 lg:row-start-1 lg:gap-3">
        <Eyebrow text={work.eyebrow} />
        <h3 id={titleId} className="text-[1.375rem] font-extrabold tracking-[-0.02em] lg:text-[1.75rem]">
          {work.title}
        </h3>
      </div>

      <div className="mt-1 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:mt-0">
        <Figure work={work} />
      </div>

      <div className="flex flex-col gap-3 lg:col-start-1 lg:row-start-2 lg:gap-3.5">
        <p className="mt-1 text-[1.0625rem] leading-[1.45] font-semibold lg:mt-0 lg:text-xl">{work.headline}</p>
        <Facts work={work} />
        <div className="mt-1">
          <Metric {...work.metric} />
        </div>
        {work.links.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {work.links.map((link, i) => (
              <ButtonLink key={link.href} href={link.href} variant={i === 0 ? "solid" : "outline"}>
                {link.label}
              </ButtonLink>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}
