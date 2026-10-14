// 길이 단위 규칙 (docs/03-design.md 원칙 7)
// 손으로 쓰는 길이는 rem으로 쓴다. 테두리는 Tailwind 기본 유틸리티(border, border-2)만 쓴다.
// px 숫자가 꼭 필요한 줄(HTML 속성, JS 측정값 등)은 줄 끝 주석에 px-ok를 단다.

export const ALLOW_MARK = "px-ok";

// 앞이 글자나 점이면 식별자의 일부이므로 건너뛴다. h-px 같은 Tailwind 유틸리티는 숫자가 없어 걸리지 않는다.
const PX = /(?<![\w.])(?:\d+(?:\.\d+)?|\.\d+)px\b/g;
const COMMENT_LINE = /^\s*(\/\/|\/\*|\*)/;

export function scanUnits(content) {
  const findings = [];
  content.split("\n").forEach((text, i) => {
    if (text.includes(ALLOW_MARK) || COMMENT_LINE.test(text)) return;
    for (const match of text.matchAll(PX)) {
      findings.push({ line: i + 1, value: match[0] });
    }
  });
  return findings;
}
