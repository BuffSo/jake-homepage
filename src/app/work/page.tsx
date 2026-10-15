import type { Metadata } from "next";
import { SectionHead } from "@/components/section-head";
import { Chapter } from "@/components/work/chapter";
import { SiteCards } from "@/components/work/site-cards";
import { WorkIndex } from "@/components/work/work-index";
import { getProjects, getSites, getWork, getWorkChapters } from "@/lib/content";

// 포트폴리오 (docs/02-ia.md /work). 머리 → 목차 → 서비스 챕터 → 의뢰받아 만든 사이트.
// 서비스 챕터는 동기화한 포트폴리오 원문을 그대로 그린다 (src/lib/portfolio.mjs).
const work = getWork();

export const metadata: Metadata = {
  title: `${work.title} · 소재희`,
  description: work.intro,
};

export default function WorkPage() {
  const chapters = getWorkChapters();
  const projects = new Map(getProjects().map((p) => [p.slug, p]));
  const sites = getSites();

  const index = [
    ...chapters.map((c) => ({
      href: `#${c.slug}`,
      num: String(projects.get(c.slug)!.order).padStart(2, "0"),
      name: c.head.name,
      note: c.head.subtitle,
    })),
    { href: "#sites", num: work.sites.label, name: work.sites.title, note: sites.map((s) => s.title).join(" · ") },
  ];

  return (
    <main id="main" className="mx-auto w-full max-w-7xl flex-1 px-4 md:px-16">
      <div className="pt-10 lg:pt-18">
        <SectionHead
          as="h1"
          id="work-title"
          label={work.label}
          title={work.title}
          intro={`${work.intro} ${work.introSite}`}
        />
      </div>
      <WorkIndex items={index} />
      {chapters.map((chapter, i) => (
        <Chapter
          key={chapter.slug}
          chapter={chapter}
          project={projects.get(chapter.slug)!}
          total={chapters.length}
          first={i === 0}
        />
      ))}
      <SiteCards head={work.sites} sites={sites} />
    </main>
  );
}
