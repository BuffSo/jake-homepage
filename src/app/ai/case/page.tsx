import type { Metadata } from "next";
import Link from "next/link";
import { CasePanel } from "@/components/ai/case-panel";
import { ButtonLink } from "@/components/button-link";
import { SectionHead } from "@/components/section-head";
import { firstSentence } from "@/lib/ai-case.mjs";
import { getAiCase, getHome } from "@/lib/content";
import { pageMetadata } from "@/lib/site-meta";

// AI 도구 활용 사례 (docs/02-ia.md /ai/case). 돌아가기 링크 → 머리 → 4컷 → 본문 → 끝 링크로, 원본 PDF와 같은 순서다.
// 글은 커리어 저장소의 사례 파일을 동기화한 것이고 문장은 고치지 않는다 (ADR-0003 원본 추가).
// 목차가 없고 화면 세 개 남짓이라 맨 위로 버튼은 두지 않는다.
const aiCase = getAiCase();
const { ai } = getHome().sections;

export const metadata: Metadata = pageMetadata({
  title: `${aiCase.title} · 소재희`,
  description: firstSentence(aiCase.body[aiCase.body.length - 1]),
  path: "/ai/case",
});

export default function AiCasePage() {
  return (
    <main id="main" className="mx-auto w-full max-w-7xl flex-1 px-4 pb-18 md:px-16 lg:pb-30">
      <div className="pt-6 lg:pt-10">
        <Link href="/ai" className="inline-flex min-h-11 items-center gap-1 text-sm text-muted hover:text-fg">
          <span aria-hidden="true">←</span>
          {ai.title}
        </Link>
      </div>
      <div className="pt-4 lg:pt-6">
        <SectionHead as="h1" id="case-title" label="AI / CASE" title={aiCase.title} intro={aiCase.subtitle} />
      </div>

      <div className="border-t border-fg pt-7 lg:pt-10">
        <ol aria-label="4컷" className="grid gap-7 lg:max-w-[52rem] lg:grid-cols-2 lg:gap-10">
          {aiCase.panels.map((panel, i) => (
            <li key={panel.caption}>
              <figure className="flex flex-col gap-3">
                <CasePanel
                  crop={panel.crop}
                  sizes="(min-width: 64rem) 56rem, 226vw"
                  className="rounded-[0.625rem] border border-line"
                  eager
                />
                <figcaption className="grid grid-cols-[1.5rem_minmax(0,1fr)] gap-2.5 text-sm leading-[1.65] lg:text-[0.9375rem]">
                  <span
                    aria-hidden="true"
                    className="mt-[0.0625rem] flex size-6 items-center justify-center rounded-full bg-accent text-xs font-bold text-on-accent"
                  >
                    {i + 1}
                  </span>
                  <span>{panel.caption}</span>
                </figcaption>
              </figure>
            </li>
          ))}
        </ol>
      </div>

      <section aria-labelledby="case-body-title" className="mt-14 border-t border-line pt-14 lg:mt-24 lg:pt-24">
        <div className="max-w-[45rem]">
          <h2 id="case-body-title" className="mb-5 text-2xl font-extrabold tracking-[-0.02em] lg:mb-6 lg:text-[2rem]">
            {aiCase.heading}
          </h2>
          {aiCase.body.map((paragraph) => (
            <p key={paragraph} className="mt-4 text-[0.9375rem] leading-[1.75] lg:text-[1.0625rem]">
              {paragraph}
            </p>
          ))}
          <div className="mt-10 flex flex-wrap gap-2">
            <ButtonLink href="/work#prowith-ai" variant="solid">
              포트폴리오 원문 보기
            </ButtonLink>
            <ButtonLink href="/ai">{ai.title}</ButtonLink>
          </div>
        </div>
      </section>
    </main>
  );
}
