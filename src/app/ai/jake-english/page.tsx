import type { Metadata } from "next";
import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
import { ButtonLink } from "@/components/button-link";
import { ExternalLink } from "@/components/external-link";
import { SectionHead } from "@/components/section-head";
import { getHome, getJakeEnglish } from "@/lib/content";
import { FLOW_IMAGES, SLIDE_IMAGES, STORY_IMAGES, VIDEO_THUMB } from "@/lib/jake-english-images";
import { pageMetadata } from "@/lib/site-meta";

// Jake English 소개 (docs/02-ia.md /ai/jake-english). 돌아가기 링크 → 머리 → 영상 → 이야기 4컷 → 연습하는 방법 → 본문 다섯 장 → 끝 링크 순서다.
// 글은 사이트 전용 글(content/site/jake-english.md)이다. 그림은 공개한 소개 영상에서 가져왔고, 이야기 4컷만 Gemini 앱으로 그렸다.
// 그림의 대체 텍스트는 모두 비운다. 영상 썸네일은 링크 글이, 이야기 4컷과 연습하는 방법은 설명이, 슬라이드는 바로 아래 문단이 같은 내용을 말하기 때문이다(/ai/case와 같은 규칙).
// 목차가 없는 서브페이지라 /ai/case처럼 맨 위로 버튼과 다음 페이지 버튼은 두지 않는다.
const je = getJakeEnglish();
const { ai } = getHome().sections;

export const metadata: Metadata = pageMetadata({
  title: `${je.title} · 소재희`,
  description: je.description,
  path: "/ai/jake-english",
});

export default function JakeEnglishPage() {
  return (
    <main id="main" className="mx-auto w-full max-w-7xl flex-1 px-4 pb-18 md:px-16 lg:pb-30">
      <div className="pt-6 lg:pt-10">
        <Link href="/ai" className="inline-flex min-h-11 items-center gap-1 text-sm text-muted hover:text-fg">
          <span aria-hidden="true">←</span>
          {ai.title}
        </Link>
      </div>
      <div className="pt-4 lg:pt-6">
        <SectionHead as="h1" id="je-title" label="AI / APP" title={je.title} intro={je.subtitle} />
      </div>

      <ExternalLink href={je.video.href} className="group mb-10 block lg:mb-14 lg:max-w-[52rem]">
        <span className="relative block overflow-hidden rounded-xl border border-line">
          <Image
            src={VIDEO_THUMB}
            alt=""
            sizes="(min-width: 64rem) 52rem, 100vw"
            className="aspect-video w-full object-cover"
            loading="eager"
          />
          <span
            aria-hidden="true"
            className="absolute top-1/2 left-1/2 flex h-[3.125rem] w-[4.5rem] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-[0.875rem] bg-black/72"
          >
            <svg viewBox="0 0 18 20" className="ml-0.5 w-[1.125rem] fill-white">
              <path d="M0 0L18 10L0 20Z" />
            </svg>
          </span>
        </span>
        <span className="mt-3 block text-sm text-muted group-hover:text-fg">
          {je.video.caption} <span aria-hidden="true">→</span>
        </span>
      </ExternalLink>

      <section aria-labelledby="story-title" className="border-t border-fg pt-7 lg:pt-10">
        <h2 id="story-title" className="mb-5 text-2xl font-extrabold tracking-[-0.02em] lg:mb-6 lg:text-[2rem]">
          이야기 4컷
        </h2>
        <Panels images={STORY_IMAGES} captions={je.story} aspect="aspect-square" numbered />
      </section>

      <section aria-labelledby="flow-title" className="mt-14 border-t border-line pt-14 lg:mt-24 lg:pt-24">
        <h2 id="flow-title" className="mb-5 text-2xl font-extrabold tracking-[-0.02em] lg:mb-6 lg:text-[2rem]">
          연습하는 방법
        </h2>
        <Panels images={FLOW_IMAGES} captions={je.panels} aspect="aspect-video" numbered={false} />
      </section>

      <div className="mt-14 border-t border-line pt-14 lg:mt-24 lg:pt-24">
        <div className="max-w-[45rem]">
          {je.chapters.map((chapter, i) => (
            <section key={chapter.title} aria-labelledby={`chapter-${i + 1}`} className={i > 0 ? "mt-12 lg:mt-16" : ""}>
              <p className="font-mono text-[0.6875rem] tracking-[0.04em] text-subtle lg:text-[0.8125rem]">
                {i + 1} / {je.chapters.length}
              </p>
              <h2 id={`chapter-${i + 1}`} className="mt-1 mb-4 text-xl font-extrabold tracking-[-0.02em] lg:text-2xl">
                {chapter.title}
              </h2>
              {chapter.metric ? (
                <div className="flex flex-col gap-0.5 border-t border-line-soft pt-2.5 lg:pt-3">
                  <span className="text-[2rem] font-bold lg:text-[2.5rem]">{chapter.metric.value}</span>
                  <span className="text-xs text-subtle">{chapter.metric.label}</span>
                </div>
              ) : (
                <Image
                  src={SLIDE_IMAGES[i]}
                  alt=""
                  sizes="(min-width: 64rem) 45rem, 100vw"
                  className="w-full rounded-[0.625rem] border border-line"
                />
              )}
              <p className="mt-4 text-[0.9375rem] leading-[1.75] lg:text-[1.0625rem]">{chapter.body}</p>
            </section>
          ))}
          <div className="mt-12 flex flex-wrap gap-2">
            <ButtonLink href={je.video.href} variant="solid">
              영상 보기
            </ButtonLink>
            <ButtonLink href="/ai">{ai.title}</ButtonLink>
          </div>
        </div>
      </div>
    </main>
  );
}

// 설명이 붙은 그림 칸 2열 목록. 이야기 4컷(정사각, 번호 있음)과 연습하는 방법(16:9, 번호 없음)이 같이 쓴다. 연습하는 방법은 칸마다 연습 종류가 달라 번호를 붙이지 않는다. 두 절 모두 영상 아래라 그림은 기본(lazy)으로 불러온다.
function Panels({
  images,
  captions,
  aspect,
  numbered,
}: {
  images: StaticImageData[];
  captions: { caption: string }[];
  aspect: "aspect-square" | "aspect-video";
  numbered: boolean;
}) {
  return (
    <ol className="grid gap-7 lg:max-w-[52rem] lg:grid-cols-2 lg:gap-10">
      {captions.map((panel, i) => (
        <li key={panel.caption}>
          <figure className="flex flex-col gap-3">
            <Image
              src={images[i]}
              alt=""
              sizes="(min-width: 64rem) 26rem, 100vw"
              className={`${aspect} w-full rounded-[0.625rem] border border-line`}
            />
            {numbered ? (
              <figcaption className="grid grid-cols-[1.5rem_minmax(0,1fr)] gap-2.5 text-sm leading-[1.65] lg:text-[0.9375rem]">
                <span
                  aria-hidden="true"
                  className="mt-[0.0625rem] flex size-6 items-center justify-center rounded-full bg-accent text-xs font-bold text-on-accent"
                >
                  {i + 1}
                </span>
                <span>{panel.caption}</span>
              </figcaption>
            ) : (
              <figcaption className="text-sm leading-[1.65] lg:text-[0.9375rem]">{panel.caption}</figcaption>
            )}
          </figure>
        </li>
      ))}
    </ol>
  );
}
