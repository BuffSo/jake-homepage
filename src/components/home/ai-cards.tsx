import Image from "next/image";
import { ButtonLink } from "@/components/button-link";
import { assetImage } from "@/lib/asset-images";
import { getHome, getHomeAiWorks, type AiVideo, type AiWork } from "@/lib/content";
import { CARD_FRAME, CARD_FRAME_STEPS, HermesFlow, SiteSteps, WikiFlow } from "@/components/ai-figures";
import { Metric, SectionHead } from "@/components/section-head";

// AI로 일하는 방식 (docs/02-ia.md 홈 3). 카드 네 장, 자세한 내용은 /ai의 해당 항목(/ai#slug)에서 보여 준다.

function Figure({ work }: { work: AiWork }) {
  switch (work.figure) {
    case "wiki-flow":
      return <WikiFlow className={CARD_FRAME} />;
    case "hermes-flow":
      return <HermesFlow className={CARD_FRAME} />;
    case "site-steps":
      return <SiteSteps className={CARD_FRAME_STEPS} />;
    case "videos":
      return <VideoStack videos={work.videos!} />;
  }
}

// 영상 카드 그림: 목록의 마지막 두 편을 같은 크기로 겹친다. 먼저 만든 편이 뒤 왼쪽 위, 나중 편이 앞 오른쪽 아래다
// (docs/03-design.md 홈 영상 카드). 자리는 칸 가운데 2:1 무대를 기준으로 잡아, 휴대폰보다 넓은 한 칸 화면에서도
// 썸네일이 칸 높이를 넘지 않는다. 썸네일 한 장은 무대 폭의 64%다.
const THUMB = "absolute aspect-video w-[64%] rounded-md border border-line object-cover lg:rounded-lg";
const THUMB_SIZES = "(min-width: 80rem) 23rem, (min-width: 48rem) 29vw, 60vw";

function VideoStack({ videos }: { videos: AiVideo[] }) {
  const [back, front] = videos.slice(-2);
  return (
    <div className={`${CARD_FRAME} bg-surface`}>
      <div className="relative mx-auto aspect-[2/1] h-full max-w-full">
        {[
          { video: back, place: "top-[9%] left-[7%]" },
          { video: front, place: "right-[7%] bottom-[9%]" },
        ].map(({ video, place }) => (
          <Image
            key={video.thumbnail}
            src={assetImage(video.thumbnail)}
            alt={video.thumbnailAlt}
            sizes={THUMB_SIZES}
            className={`${THUMB} ${place}`}
          />
        ))}
      </div>
    </div>
  );
}

export function AiCards() {
  const { ai } = getHome().sections;
  const works = getHomeAiWorks();

  return (
    <section aria-labelledby="ai-title" className="mt-14 border-t border-line py-14 lg:mt-24 lg:py-24">
      <SectionHead id="ai-title" {...ai} />
      <div className="grid gap-5 md:grid-cols-2 lg:gap-8">
        {works.map((work) => {
          // 머리글의 영문 이름은 고정폭, 한글 설명은 본문 글꼴로 쓴다 (globals.css 글꼴 순서)
          const [tag, ...rest] = work.eyebrow.split(" · ");
          return (
            <article key={work.slug} className="flex flex-col overflow-hidden rounded-[0.625rem] border border-line lg:rounded-xl">
              <Figure work={work} />
              <div className="flex grow flex-col gap-2.5 p-[1.125rem] lg:gap-3 lg:p-6">
                <span className="text-[0.6875rem] text-subtle lg:text-xs">
                  <span className="font-mono tracking-[0.04em]">{tag}</span>
                  {rest.length > 0 && ` · ${rest.join(" · ")}`}
                </span>
                <h3 className="text-[1.1875rem] leading-[1.4] font-bold lg:text-[1.375rem] lg:leading-[1.35]">{work.headline}</h3>
                <p className="text-sm leading-[1.6] text-muted lg:text-[0.9375rem]">{work.desc}</p>
                {work.note && <p className="text-xs leading-[1.6] text-subtle lg:text-[0.8125rem]">{work.note}</p>}
                <div className="mt-auto">
                  <Metric {...work.metric} />
                </div>
                {/* 바깥 링크(영상, 저장소)는 /ai 항목에서 연다. 홈 카드의 버튼은 자세히 보기 하나다. */}
                <div className="mt-1">
                  <ButtonLink href={`/ai#${work.slug}`}>자세히 보기</ButtonLink>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
