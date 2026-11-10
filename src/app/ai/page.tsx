import type { Metadata } from "next";
import Image from "next/image";
import { AiEntry } from "@/components/ai/ai-entry";
import { AiIndex } from "@/components/ai/ai-index";
import { AiItem } from "@/components/ai/ai-item";
import { AiShort } from "@/components/ai/ai-short";
import { CasePanel } from "@/components/ai/case-panel";
import { BackToTop } from "@/components/back-to-top";
import { SectionHead } from "@/components/section-head";
import { getAiCase, getAiPage, getAiWorks, getHome, getJakeEnglish } from "@/lib/content";
import { ENTRY_IMAGES } from "@/lib/jake-english-images";
import { nextPage } from "@/lib/nav";
import { pageMetadata } from "@/lib/site-meta";

// AI로 일하는 방식 (docs/02-ia.md /ai). 머리 → 입구 띠 둘 → 목차 → 네 묶음. 머리 글은 홈 섹션과 같다.
const { ai } = getHome().sections;

export const metadata: Metadata = pageMetadata({
  title: `${ai.title} · 소재희`,
  description: ai.intro,
  path: "/ai",
});

export default function AiPage() {
  const works = getAiWorks();
  const groups = getAiPage().groups.map((group) => ({
    ...group,
    works: works.filter((work) => work.group === group.id),
  }));

  const aiCase = getAiCase();
  const je = getJakeEnglish();

  return (
    <>
      <main id="main" className="mx-auto w-full max-w-7xl flex-1 px-4 md:px-16">
        <div className="pt-10 lg:pt-18">
          <SectionHead as="h1" id="ai-title" {...ai} />
        </div>
        <div className="mb-6 grid gap-3 lg:mb-10 lg:grid-cols-2 lg:gap-4">
          <AiEntry href="/ai/case" eyebrow={`CASE · ${aiCase.subtitle}`} title={aiCase.title}>
            {aiCase.panels.map((panel) => (
              <CasePanel
                key={panel.caption}
                crop={panel.crop}
                sizes="(min-width: 64rem) 18rem, 57vw"
                className="rounded-md border border-line-soft"
              />
            ))}
          </AiEntry>
          <AiEntry href="/ai/jake-english" eyebrow={`APP · ${je.subtitle}`} title={je.title}>
            {ENTRY_IMAGES.map((image) => (
              <Image
                key={image.src}
                src={image}
                alt=""
                sizes="(min-width: 64rem) 8rem, 22vw"
                className="aspect-square w-full rounded-md border border-line-soft"
              />
            ))}
          </AiEntry>
        </div>
        <AiIndex groups={groups} />
        {groups.map((group, i) => (
          <section
            key={group.id}
            id={group.id}
            aria-labelledby={`${group.id}-title`}
            className={`scroll-mt-4 pt-14 lg:pt-24 ${i > 0 ? "mt-14 border-t border-line lg:mt-24" : ""} ${
              i === groups.length - 1 ? "pb-18 lg:pb-30" : ""
            }`}
          >
            <div className="flex flex-col gap-1.5 lg:gap-2">
              <span className="font-mono text-[0.6875rem] tracking-[0.04em] text-subtle lg:text-[0.8125rem]">
                {String(i + 1).padStart(2, "0")} / {String(groups.length).padStart(2, "0")}
              </span>
              <h2 id={`${group.id}-title`} className="text-2xl font-extrabold tracking-[-0.02em] lg:text-[2rem]">
                {group.title}
              </h2>
            </div>
            {group.works.map((work, j) =>
              work.more ? (
                <AiShort key={work.slug} work={work} />
              ) : (
                <AiItem key={work.slug} work={work} first={j === 0} />
              ),
            )}
          </section>
        ))}
      </main>
      <BackToTop target="page-index" next={nextPage("/ai")} />
    </>
  );
}
