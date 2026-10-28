import Markdown, { type Components, type Options } from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkCjkFriendly from "remark-cjk-friendly";
import remarkGfm from "remark-gfm";
import { rehypeDropStyle, rehypeGroupTitles, rehypeHeadingIds, rehypeReviews, rehypeStackTables, remarkSoftBreaks } from "@/lib/markdown-plugins.mjs";
import { ExternalLink } from "./external-link";

// 포트폴리오와 이력서 원문을 그린다 (ADR-0009). 서버 컴포넌트에서만 쓴다. 모양은 globals.css의 .md가 정한다.
// 원문 HTML(<br>, <span>)은 rehype-raw로 읽고, 원문이 정한 style 속성은 버린다.
// remark-cjk-friendly는 한글 조사 앞의 닫는 **도 강조로 읽게 한다. 예: **`DEMO Login`**에서

const components: Components = {
  // 다른 사이트로 가는 링크는 새 창으로 열고 ↗를 붙인다 (docs/03-design.md).
  a: ({ href = "", children }) =>
    /^https?:\/\//.test(href) ? (
      <ExternalLink href={href}>
        {children}
        <span aria-hidden="true"> ↗</span>
      </ExternalLink>
    ) : (
      <a href={href}>{children}</a>
    ),
  // 넓은 표는 상자 안에서만 가로로 넘긴다. 키보드로도 넘길 수 있게 초점을 받는다.
  // rehypeStackTables가 고른 표는 클래스(md-stack)를 바깥 상자로 옮겨 globals.css가 모바일 모양을 정하게 하고, 역할은 표에 둔다.
  table: ({ children, className, role }) => (
    <div className={className ? `md-table ${className}` : "md-table"} role="region" aria-label="표" tabIndex={0}>
      <table role={role}>{children}</table>
    </div>
  ),
  // 원문 이미지는 확인한 것만 싣는다. 지금은 content/site/work.md가 모두 빼므로 그리지 않는다.
  img: () => null,
};

/**
 * bare면 바깥 div 없이 그린다. 이미 .md 안에서 다른 요소와 섞어 쓸 때 쓴다.
 * breaks면 문단 안의 줄바꿈을 살리고, headingIds(절 제목 → id)를 주면 h2에 id를 붙인다.
 * reviews({ label, quotes })를 주면 머리글 뒤의 인용을 동료 평가 상자로 묶고, 정해 둔 글이 든 상자에 id를 붙인다.
 * stackTables면 좁은 화면에서 넘치는 표(연락처, 학력)를 모바일에서 행마다 상자로 그린다.
 * groupTitles면 목록 바로 앞의 굵은 글씨만 있는 줄을 그 목록의 묶음 제목으로 붙여 그린다. 넷 다 지금은 이력서만 쓴다.
 */
export function MarkdownText({
  children,
  className = "",
  bare = false,
  breaks = false,
  headingIds,
  reviews,
  stackTables = false,
  groupTitles = false,
}: {
  children: string;
  className?: string;
  bare?: boolean;
  breaks?: boolean;
  headingIds?: Record<string, string>;
  reviews?: { label: string; quotes: { id: string; text: string }[] };
  stackTables?: boolean;
  groupTitles?: boolean;
}) {
  const remarkPlugins: Options["remarkPlugins"] = [remarkGfm, remarkCjkFriendly];
  if (breaks) remarkPlugins.push(remarkSoftBreaks);
  const rehypePlugins: Options["rehypePlugins"] = [rehypeRaw, rehypeDropStyle];
  if (headingIds) rehypePlugins.push([rehypeHeadingIds, { ids: headingIds }]);
  if (reviews) rehypePlugins.push([rehypeReviews, reviews]);
  if (stackTables) rehypePlugins.push(rehypeStackTables);
  if (groupTitles) rehypePlugins.push(rehypeGroupTitles);

  const markdown = (
    <Markdown remarkPlugins={remarkPlugins} rehypePlugins={rehypePlugins} components={components}>
      {children}
    </Markdown>
  );
  return bare ? markdown : <div className={`md ${className}`}>{markdown}</div>;
}
