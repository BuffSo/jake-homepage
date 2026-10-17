import type { Metadata } from "next";
import { BackToTop } from "@/components/back-to-top";
import { MarkdownText } from "@/components/markdown";
import { ResumeHead } from "@/components/resume/resume-head";
import { ResumeIndex } from "@/components/resume/resume-index";
import { getResume, getResumePage } from "@/lib/content";

// 이력서 (docs/02-ia.md /resume). 머리 → 목차 → 원문 열 절. 원문 문장은 고치지 않는다.
// 인쇄하면 헤더, 푸터, 목차, 버튼이 빠지고 한 줄 소개와 이름부터 A4로 나온다(globals.css @media print).
const page = getResumePage();

export const metadata: Metadata = {
  title: `${page.title} · 소재희`,
  description: page.description,
};

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
          quoteIds={page.quotes}
        >
          {resume.body}
        </MarkdownText>
      </main>
      <BackToTop target="page-index" />
    </>
  );
}
