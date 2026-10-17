import type { Metadata } from "next";
import Image from "next/image";
import sea from "@/assets/resume-sea.jpg";
import { BackToTop } from "@/components/back-to-top";
import { MarkdownText } from "@/components/markdown";
import { ResumeHead } from "@/components/resume/resume-head";
import { ResumeIndex } from "@/components/resume/resume-index";
import { getResume, getResumePage } from "@/lib/content";
import { pageMetadata } from "@/lib/site-meta";

// 이력서 (docs/02-ia.md /resume). 머리 → 목차 → 원문 열 절 → 끝 사진. 원문 문장은 고치지 않는다.
// 인쇄하면 헤더, 푸터, 목차, 버튼이 빠지고 한 줄 소개와 이름부터 A4로 나온다(globals.css @media print).
const page = getResumePage();

export const metadata: Metadata = pageMetadata({
  title: `${page.title} · 소재희`,
  description: page.description,
  path: "/resume",
});

export default function ResumePage() {
  const resume = getResume();
  const headingIds = Object.fromEntries(page.sections.map((section) => [section.title, section.id]));

  return (
    <>
      <main id="main" className="mx-auto w-full max-w-7xl flex-1 px-4 pb-18 md:px-16 lg:pb-30 print:p-0">
        <div className="pt-10 lg:pt-18 print:pt-0">
          <ResumeHead label={page.label} tagline={resume.tagline} name={resume.name} print={page.print} />
        </div>
        <ResumeIndex sections={page.sections} />
        <MarkdownText
          className="md-resume mt-10 max-w-[47.5rem] lg:mt-16 print:mt-[1.125rem] print:max-w-none print:border-t print:border-line-soft print:pt-[1.125rem]"
          breaks
          headingIds={headingIds}
          reviews={page.reviews}
          stackTables
        >
          {resume.body}
        </MarkdownText>
        {/* 끝까지 읽은 사람에게 건네는 사진 한 장. 캡션은 달지 않고 인쇄에서는 뺀다.
            원본 가로가 960픽셀이라 레티나에서도 선명한 30rem까지만 넓히고, 하늘을 줄이려고 16:9로 아래쪽을 남긴다. */}
        <Image
          src={sea}
          alt={page.endPhotoAlt}
          sizes="(min-width: 32rem) 30rem, 100vw"
          className="mt-16 aspect-video w-full max-w-[30rem] rounded-[0.625rem] border border-line object-cover object-bottom lg:mt-24 lg:rounded-xl print:hidden"
        />
      </main>
      <BackToTop target="page-index" />
    </>
  );
}
