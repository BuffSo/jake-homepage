// md 파일 맨 앞의 --- 블록을 yaml로 읽는다 (ADR-0007).
// 사이트(src/lib/content.ts)와 사실 검사 테스트(scripts/lib/content.test.mjs)가 같이 쓴다.

import { parse } from "yaml";

const BLOCK = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/;

export function parseFrontmatter(text, file = "") {
  const match = text.match(BLOCK);
  if (!match) throw new Error(`frontmatter가 없습니다: ${file}`);
  return { data: parse(match[1]) ?? {}, body: text.slice(match[0].length) };
}
