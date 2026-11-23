import type { Metadata } from "next";
import Image from "next/image";
import sea from "@/assets/resume-sea.jpg";
import { AwardBand } from "@/components/award-band";
import { BackToTop } from "@/components/back-to-top";
import { MarkdownText } from "@/components/markdown";
import { ResumeHead } from "@/components/resume/resume-head";
import { ResumeIndex } from "@/components/resume/resume-index";
import { getHome, getResume, getResumePage } from "@/lib/content";
import { nextPage } from "@/lib/nav";
import { pageMetadata } from "@/lib/site-meta";

// 이력서 (docs/02-ia.md /resume). 머리 → 대회 결과 띠 → 목차 → 원문의 절 → 끝 사진. 원문 문장은 고치지 않는다.
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
        {/* 대회 결과 띠. 문구와 링크는 홈 AI 섹션 띠와 같은 값이고, 여기서는 NEW 뱃지를 단다.
            인쇄에서는 뺀다. 같은 사실이 본문 자기소개와 대외활동 절에 글자로 있다. */}
        <AwardBand {...getHome().sections.ai.award} badge={page.awardBadge} className="mb-6 lg:mb-10 print:hidden" />
        {/* 목차는 열 칸을 유지한다. index: false인 절(대외활동)은 본문에만 있다. */}
        <ResumeIndex sections={page.sections.filter((section) => section.index !== false)} />
        <MarkdownText
          className="md-resume mt-10 max-w-[47.5rem] lg:mt-16 print:mt-[1.125rem] print:max-w-none print:border-t print:border-line-soft print:pt-[1.125rem]"
          breaks
          groupTitles
          chips
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
      <BackToTop target="page-index" next={nextPage("/resume")} />
    </>
  );
}
