import Image from "next/image";
import { ButtonLink } from "@/components/button-link";
import { MarkdownText } from "@/components/markdown";
import type { Project, WorkChapter } from "@/lib/content";
import { PROJECT_IMAGES } from "@/lib/project-images";
import { StackChips } from "./stack-chips";

// 서비스 챕터 (docs/02-ia.md /work). 머리는 포트폴리오 "4-x" 절의 첫 줄들로, 본문은 원문 그대로 그린다.
// 데스크톱은 머리를 두 칸(글 왼쪽, 캡처 오른쪽)으로 두고, 모바일은 이름 다음에 캡처를 둔다.
// id는 서비스 slug다. 홈 카드의 "자세히 보기"(/work#slug)가 이곳을 가리킨다.
export function Chapter({
  chapter,
  project,
  total,
  first,
}: {
  chapter: WorkChapter;
  project: Project;
  total: number;
  first: boolean;
}) {
  const { head } = chapter;
  const titleId = `${chapter.slug}-title`;
  const body = chapter.ai ? `${chapter.body}\n\n### ${chapter.ai.title}\n\n${chapter.ai.body}` : chapter.body;

  return (
    <section
      id={chapter.slug}
      aria-labelledby={titleId}
      className={`scroll-mt-4 pt-14 lg:pt-24 ${first ? "" : "mt-14 border-t border-line lg:mt-24"}`}
    >
      {/* 열을 minmax(0, 1fr)로 고정한다. 그러지 않으면 캡처의 원래 폭만큼 열이 늘어나 모바일에 가로 스크롤이 생긴다. */}
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2 lg:grid-rows-[auto_1fr] lg:gap-x-12 lg:gap-y-3.5">
        <div className="flex flex-col gap-3 lg:col-start-1 lg:row-start-1 lg:gap-3.5">
          <span className="font-mono text-[0.6875rem] tracking-[0.04em] text-subtle lg:text-[0.8125rem]">
            {String(project.order).padStart(2, "0")} / {String(total).padStart(2, "0")} · {head.name.toUpperCase()}
          </span>
          <div className="flex flex-col gap-0.5 lg:gap-1">
            <h2 id={titleId} className="text-[1.75rem] font-extrabold tracking-[-0.025em] lg:text-[2.5rem]">
              {head.name}
            </h2>
            <p className="text-[0.9375rem] text-muted lg:text-[1.0625rem]">{head.subtitle}</p>
          </div>
        </div>

        <Image
          src={PROJECT_IMAGES[chapter.slug]}
          alt={project.imageAlt}
          sizes="(min-width: 80rem) 35rem, (min-width: 64rem) 45vw, 100vw"
          className="mt-1 h-auto w-full rounded-[0.625rem] border border-line lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:mt-0 lg:rounded-xl"
        />

        <div className="flex flex-col items-start gap-3 lg:col-start-1 lg:row-start-2 lg:gap-3.5">
          <p className="mt-1 text-lg leading-[1.45] font-semibold lg:mt-1.5 lg:text-[1.375rem]">{head.lead}</p>
          <p className="text-xs leading-[1.6] text-subtle lg:text-[0.8125rem]">
            {head.period} · {head.role}
          </p>
          <StackChips items={head.stack} />
          <div className="mt-1 lg:mt-1.5">
            <ButtonLink href={head.url} variant="solid">
              {project.liveLabel ?? "서비스 열기"}
            </ButtonLink>
          </div>
          <div className="w-full rounded-[0.625rem] border border-line-soft bg-surface px-4 py-3.5 lg:mt-1.5 lg:rounded-xl lg:px-[1.125rem] lg:py-4">
            <p className="mb-1.5 text-[0.6875rem] text-subtle lg:text-xs">보시는 방법</p>
            <MarkdownText className="md-note">{chapter.howToView}</MarkdownText>
          </div>
        </div>
      </div>

      <MarkdownText className="mt-10 max-w-[47.5rem] lg:mt-16">{body}</MarkdownText>
    </section>
  );
}
