import type { Metadata } from "next";
import { AiIndex } from "@/components/ai/ai-index";
import { AiItem } from "@/components/ai/ai-item";
import { AiShort } from "@/components/ai/ai-short";
import { BackToTop } from "@/components/back-to-top";
import { SectionHead } from "@/components/section-head";
import { getAiPage, getAiWorks, getHome } from "@/lib/content";

// AI로 일하는 방식 (docs/02-ia.md /ai). 머리 → 목차 → 네 묶음. 머리 글은 홈 섹션과 같다.
const { ai } = getHome().sections;

export const metadata: Metadata = {
  title: `${ai.title} · 소재희`,
  description: ai.intro,
};

export default function AiPage() {
  const works = getAiWorks();
  const groups = getAiPage().groups.map((group) => ({
    ...group,
    works: works.filter((work) => work.group === group.id),
  }));

  return (
    <>
      <main id="main" className="mx-auto w-full max-w-7xl flex-1 px-4 md:px-16">
        <div className="pt-10 lg:pt-18">
          <SectionHead as="h1" id="ai-title" {...ai} />
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
      <BackToTop target="page-index" />
    </>
  );
}
