import Markdown, { type Components } from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import { ExternalLink } from "./external-link";

// 포트폴리오 원문을 그린다 (ADR-0009). 서버 컴포넌트에서만 쓴다. 모양은 globals.css의 .md가 정한다.
// 원문 HTML(<br>, <span>)은 rehype-raw로 읽고, 원문이 정한 style 속성은 버린다.

type HastNode = { properties?: Record<string, unknown>; children?: HastNode[] };

function rehypeDropStyle() {
  const walk = (node: HastNode) => {
    if (node.properties) delete node.properties.style;
    node.children?.forEach(walk);
  };
  return (tree: HastNode) => walk(tree);
}

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
  table: ({ children }) => (
    <div className="md-table" role="region" aria-label="표" tabIndex={0}>
      <table>{children}</table>
    </div>
  ),
  // 원문 이미지는 확인한 것만 싣는다. 지금은 content/site/work.md가 모두 빼므로 그리지 않는다.
  img: () => null,
};

/** bare면 바깥 div 없이 그린다. 이미 .md 안에서 다른 요소와 섞어 쓸 때 쓴다. */
export function MarkdownText({
  children,
  className = "",
  bare = false,
}: {
  children: string;
  className?: string;
  bare?: boolean;
}) {
  const markdown = (
    <Markdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw, rehypeDropStyle]} components={components}>
      {children}
    </Markdown>
  );
  return bare ? markdown : <div className={`md ${className}`}>{markdown}</div>;
}
