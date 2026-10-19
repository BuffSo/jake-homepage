import Image from "next/image";
import Link from "next/link";
import { ButtonLink } from "@/components/button-link";
import { Metric, SectionHead } from "@/components/section-head";
import { getHome, getProjects } from "@/lib/content";
import { CARD_IMAGES } from "@/lib/project-images";

// 운영 중인 서비스 (docs/02-ia.md 홈 2). 카드에는 실제 화면, 제목 문장, 역할과 기간, 숫자 하나만 담고
// 설명과 스택, 큰 화면은 /work에서 보여 준다. 카드의 id는 첫 화면 서비스 목록의 링크가 가리키는 곳이다.
// 카드 화면은 처음 보는 사람이 알아볼 화면이라 /work 챕터의 화면과 다를 수 있다(CARD_IMAGES).

export function ServiceCards() {
  const { work } = getHome().sections;
  const projects = getProjects();

  return (
    <section id="work" aria-labelledby="work-title" className="pt-14 lg:pt-24">
      <SectionHead id="work-title" {...work} />
      <div className="grid gap-5 lg:grid-cols-3 lg:gap-6">
        {projects.map((project) => (
          <article
            key={project.slug}
            id={project.slug}
            className="flex scroll-mt-4 flex-col overflow-hidden rounded-[0.625rem] border border-line lg:rounded-xl"
          >
            <Image
              src={CARD_IMAGES[project.slug]}
              alt={project.cardImageAlt ?? project.imageAlt}
              sizes="(min-width: 80rem) 23rem, (min-width: 64rem) 30vw, 100vw"
              className="h-[11.875rem] w-full border-b border-line object-cover object-left-top lg:h-[13.75rem]"
            />
            <div className="flex grow flex-col gap-2.5 p-[1.125rem] lg:p-[1.375rem]">
              <span className="font-mono text-[0.6875rem] tracking-[0.04em] text-subtle lg:text-xs">
                {String(project.order).padStart(2, "0")} / {String(projects.length).padStart(2, "0")} ·{" "}
                {project.title.toUpperCase()}
              </span>
              <h3 className="text-[1.1875rem] leading-[1.4] font-bold lg:text-xl">{project.headline}</h3>
              <span className="text-xs leading-[1.6] text-subtle">
                {project.role} · {project.period}
              </span>
              <div className="mt-auto">
                <Metric {...project.metric} />
              </div>
              <div className="mt-1 flex flex-wrap gap-2">
                <ButtonLink href={project.liveUrl} variant="solid">
                  {project.liveLabel ?? "서비스 열기"}
                </ButtonLink>
                <ButtonLink href={`/work#${project.slug}`}>자세히 보기</ButtonLink>
              </div>
            </div>
          </article>
        ))}
      </div>
      <div className="pt-5 lg:flex lg:justify-end lg:pt-6">
        <Link href="/work" className="text-sm underline-offset-4 hover:underline lg:text-[0.9375rem]">
          포트폴리오 전체 보기 →
        </Link>
      </div>
    </section>
  );
}
