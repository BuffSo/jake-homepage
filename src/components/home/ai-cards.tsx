import Image from "next/image";
import video from "@/assets/home/video.jpg";
import { ButtonLink } from "@/components/button-link";
import { getAiWorks, getHome, type AiWork } from "@/lib/content";
import { HermesFlow, SiteSteps, WikiFlow } from "./ai-figures";
import { Metric, SectionHead } from "@/components/section-head";

// AI로 일하는 방식 (docs/02-ia.md 홈 3). 카드 네 장, 자세한 내용은 /ai/[slug]에서 보여 준다.

function Figure({ work }: { work: AiWork }) {
  switch (work.figure) {
    case "wiki-flow":
      return <WikiFlow />;
    case "hermes-flow":
      return <HermesFlow />;
    case "site-steps":
      return <SiteSteps />;
    case "image":
      return (
        <Image
          src={video}
          alt={work.imageAlt ?? ""}
          sizes="(min-width: 80rem) 36rem, (min-width: 48rem) 45vw, 100vw"
          className="h-[11.875rem] w-full border-b border-line object-cover lg:h-[17.5rem]"
        />
      );
  }
}

export function AiCards() {
  const { ai } = getHome().sections;
  const works = getAiWorks();

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
                <div className="mt-1 flex flex-wrap gap-2">
                  {work.links.map((link) => (
                    <ButtonLink key={link.href} href={link.href} variant="solid">
                      {link.label}
                    </ButtonLink>
                  ))}
                  <ButtonLink href={`/ai/${work.slug}`}>자세히 보기</ButtonLink>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
