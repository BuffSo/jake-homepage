import type { Metadata } from "next";
import { BackToTop } from "@/components/back-to-top";
import { SectionHead } from "@/components/section-head";
import { Chapter } from "@/components/work/chapter";
import { SiteCards } from "@/components/work/site-cards";
import { WorkIndex } from "@/components/work/work-index";
import { getProjects, getSites, getWork, getWorkChapters, type Project, type WorkSlug } from "@/lib/content";
import { nextPage } from "@/lib/nav";
import { WORK_IMAGES } from "@/lib/project-images";
import { pageMetadata } from "@/lib/site-meta";

// 포트폴리오 (docs/02-ia.md /work). 머리 → 목차 → 프로젝트 챕터 → 의뢰받아 만든 사이트.
// 챕터는 동기화한 포트폴리오 원문을 그대로 그린다 (src/lib/portfolio.mjs). 번호는 work.md의 챕터 순서다.
// 캡처의 대체 텍스트와 버튼 글은 서비스 글(content/site/projects/)에서, 서비스 글이 없는 챕터(Jake English)는 work.md의 챕터 설정에서 읽는다.
const work = getWork();

export const metadata: Metadata = pageMetadata({
  title: `${work.title} · 소재희`,
  description: work.intro,
  path: "/work",
});

export default function WorkPage() {
  const chapters = getWorkChapters();
  const projects = new Map<string, Project>(getProjects().map((p) => [p.slug, p]));
  const settings = new Map(work.chapters.map((c) => [c.slug, c]));
  const imageAlt = (slug: string) => {
    const alt = projects.get(slug)?.imageAlt ?? settings.get(slug as WorkSlug)?.imageAlt;
    if (!alt) throw new Error(`/work 챕터 ${slug}의 그림에 대체 텍스트가 없습니다 (content/site/work.md의 imageAlt)`);
    return alt;
  };
  const sites = getSites();

  const index = [
    ...chapters.map((c, i) => ({
      href: `#${c.slug}`,
      num: String(i + 1).padStart(2, "0"),
      name: c.head.name,
      note: c.head.subtitle,
    })),
    { href: "#sites", num: work.sites.label, name: work.sites.title, note: sites.map((s) => s.title).join(" · ") },
  ];

  return (
    <>
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
            order={i + 1}
            image={WORK_IMAGES[chapter.slug]}
            imageAlt={imageAlt(chapter.slug)}
            liveLabel={projects.get(chapter.slug)?.liveLabel}
            total={chapters.length}
            first={i === 0}
          />
        ))}
        <SiteCards head={work.sites} sites={sites} />
      </main>
      <BackToTop target="page-index" next={nextPage("/work")} />
    </>
  );
}
