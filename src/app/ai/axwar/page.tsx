import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import certImage from "@/assets/ai/axwar/cert.png";
import { ButtonLink } from "@/components/button-link";
import { ExternalLink } from "@/components/external-link";
import { getAxwar, getHome } from "@/lib/content";
import { pageMetadata } from "@/lib/site-meta";

// AX인재전쟁 대회 결과 (docs/02-ia.md /ai/axwar). 돌아가기 링크 → 머리(대회 이름, 결과, 참가자, 인증서 카드, 덧붙임) → 본문 → 끝 링크 순서다.
// 글은 사이트 전용 글(content/site/axwar.md)이다. 홈과 /resume의 대회 결과 띠가 이 페이지로 온다. /ai에는 입구가 없다.
// 머리는 결과를 크게 보여 주는 이 페이지만의 모양이라 SectionHead를 쓰지 않는다. 메신저에서 링크를 열면
// 첫 화면 안에 결과, 인증서 카드, 덧붙임이 다 들어오게 한 배치다(설계 배치 B, 카드는 2026-11-27 비교판 B).
// 목차가 없는 서브페이지라 /ai/case, /ai/jake-english처럼 맨 위로 버튼과 다음 페이지 버튼은 두지 않는다.
const ax = getAxwar();
const { ai } = getHome().sections;

export const metadata: Metadata = pageMetadata({
  title: `${ax.title} · 소재희`,
  description: ax.body[0],
  path: "/ai/axwar",
});

export default function AxwarPage() {
  return (
    <main id="main" className="mx-auto w-full max-w-7xl flex-1 px-4 pb-18 md:px-16 lg:pb-30">
      <div className="pt-6 lg:pt-10">
        <Link href="/ai" className="inline-flex min-h-11 items-center gap-1 text-sm text-muted hover:text-fg">
          <span aria-hidden="true">←</span>
          {ai.title}
        </Link>
      </div>

      <div className="flex flex-col gap-2 pt-4 pb-7 lg:gap-3 lg:pt-6 lg:pb-10">
        <span className="font-mono text-[0.6875rem] tracking-[0.04em] text-subtle lg:text-[0.8125rem]">AI / AWARD</span>
        {/* 화면에는 두 줄이지만 h1 하나에 묶어, 화면 읽기 프로그램과 검색엔진에 무엇의 결과인지 함께 읽힌다.
            사이의 띄어쓰기는 읽을 때 두 줄이 붙지 않게 하려는 것이고, 세로로 쌓인 칸 사이라 화면에는 보이지 않는다. */}
        <h1 id="axwar-title" className="flex flex-col gap-2 lg:gap-3">
          <span className="text-base font-bold lg:text-xl">{ax.contest}</span>{" "}
          <span className="text-[3.25rem] leading-[1.1] font-extrabold tracking-[-0.025em] lg:text-[5rem]">{ax.result}</span>
        </h1>
        <p className="text-[0.9375rem] text-muted lg:text-[1.0625rem]">
          {ax.participants} · {ax.date}
        </p>
        {/* 인증서 카드. 링크드인 게시물의 링크 카드처럼 그림 전체 폭 아래에 제목과 도메인을 둔다. 카드 전체가 링크 하나다.
            그림은 저장소에 받아 둔 인증서 공유 그림이다. 대체 텍스트는 비운다. 바로 아래 제목이 같은 것을 말한다(/ai/case와 같은 규칙). */}
        <ExternalLink
          href={ax.cert.href}
          className="group mt-2 block overflow-hidden rounded-[0.625rem] border border-line hover:border-fg/40 lg:mt-3 lg:max-w-[30rem] lg:rounded-xl"
        >
          <Image
            src={certImage}
            alt=""
            sizes="(min-width: 64rem) 30rem, 100vw"
            className="aspect-[1200/630] w-full border-b border-line object-cover"
            loading="eager"
          />
          <span className="flex flex-col gap-1 px-4 py-3 lg:px-5 lg:py-3.5">
            <span className="text-[0.9375rem] leading-[1.4] font-bold group-hover:underline lg:text-base">{ax.cert.title}</span>
            <span className="text-xs text-subtle">
              {ax.cert.domain} <span aria-hidden="true">↗</span>
            </span>
          </span>
        </ExternalLink>
        {/* 덧붙임 줄. 카드 테두리 밖, 카드 아래에 띄워 둔다(머리 안 줄 사이에 더해 모바일 1rem, 데스크톱 1.5rem, 2026-11-27 비교판).
            카드의 설명 글처럼 붙어 보이면 인증서가 이 보상까지 증명하는 것으로 읽힐 수 있어, 카드 안 글과 다른 본문 글자로 쓴다. */}
        <p className="mt-2 text-[0.9375rem] leading-[1.6] lg:mt-3 lg:text-[1.0625rem]">{ax.extra}</p>
      </div>

      <div className="border-t border-fg pt-7 lg:pt-10">
        <div className="flex max-w-[45rem] flex-col gap-5">
          {ax.body.map((paragraph) => (
            <p key={paragraph} className="text-[0.9375rem] leading-[1.75] lg:text-[1.0625rem]">
              {paragraph}
            </p>
          ))}
        </div>
      </div>

      {/* 끝 링크. 인증서는 머리 아래 카드 하나로만 간다(같은 버튼이 두 번 보이지 않게, 2026-11-27) */}
      <div className="mt-12 flex flex-wrap gap-2">
        <ButtonLink href="/ai">{ai.title}</ButtonLink>
      </div>
    </main>
  );
}
