import Link from "next/link";
import { Fragment } from "react";
import { ButtonLink } from "@/components/button-link";
import { getHome } from "@/lib/content";

// About (docs/02-ia.md 홈 4). 누가 만들었는지 짧게 쓰고, 경력은 이력서로 보낸다.
// 연락 링크는 첫 화면(hero.tsx)과 여기에 둔다. 푸터에서는 반복하지 않는다.
export function About() {
  const { about, contact } = getHome();

  return (
    <section
      aria-labelledby="about-title"
      className="flex flex-col gap-5 border-t border-line pt-14 pb-18 lg:gap-7 lg:pt-24 lg:pb-[7.5rem]"
    >
      <span className="font-mono text-[0.6875rem] tracking-[0.04em] text-subtle lg:text-[0.8125rem]">{about.label}</span>
      <h2 id="about-title" className="text-[1.875rem] leading-[1.25] font-extrabold tracking-[-0.025em] lg:text-5xl lg:leading-[1.2]">
        {about.title}
      </h2>
      {/* 문단은 생각 하나씩이다: 개발 경력, 경영 경험과 그 덕분에 얻은 것, 지금 (docs/02-ia.md 홈 4).
          문단 안에서 문장은 줄을 바꿔 시작한다(\n → <br>). */}
      <div className="flex max-w-[48.75rem] flex-col gap-4 text-base leading-[1.7] lg:gap-5 lg:text-xl">
        {about.body.map((paragraph) => (
          <p key={paragraph}>
            {paragraph.split("\n").map((line, i) => (
              <Fragment key={line}>
                {i > 0 && <br />}
                {line}
              </Fragment>
            ))}
          </p>
        ))}
      </div>
      {/* 팀 프로젝트 동료 평가 세 줄. 출처는 이력서에서 그 프로젝트의 Peer Review 상자로 간다(resume-page.md의 reviews) */}
      <div className="mt-1 flex max-w-[48.75rem] flex-col gap-3 lg:mt-2 lg:gap-4">
        <h3 className="text-xs text-subtle">{about.reviewsTitle}</h3>
        <ul className="flex flex-col gap-4 lg:gap-5">
          {about.reviews.map((review) => (
            <li key={review.href}>
              <figure className="flex flex-col gap-1.5 border-l-2 border-fg pl-3.5 lg:gap-2 lg:pl-5">
                <blockquote className="text-[0.9375rem] leading-[1.6] lg:text-lg">“{review.quote}”</blockquote>
                <figcaption className="text-xs text-subtle">
                  <Link href={review.href} className="inline-flex min-h-6 items-center underline underline-offset-4 hover:text-fg">
                    {review.by}
                    <span className="sr-only"> 동료 평가 원문</span>
                  </Link>
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>
      </div>
      <div className="mt-1 flex flex-col gap-2 sm:flex-row sm:flex-wrap lg:mt-2 lg:gap-3">
        <ButtonLink href="/resume" variant="solid" className="px-5 text-sm lg:h-11">
          이력서 보기
        </ButtonLink>
        <ButtonLink href={`mailto:${contact.email}`} className="px-5 text-sm lg:h-11">
          {contact.email}
        </ButtonLink>
        <ButtonLink href={contact.github} className="px-5 text-sm lg:h-11">
          GitHub
        </ButtonLink>
      </div>
    </section>
  );
}
