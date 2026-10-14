#!/usr/bin/env node
// 첫 화면 움직임의 클라이언트 코드 용량 검사 (docs/04-motion.md 접근성과 성능: gzip 10KB 이하)
//   npm run build 뒤에 node scripts/check-motion-size.mjs
// 움직임 코드가 든 청크는 sessionStorage 키(src/components/home/intro-script.ts의 PLAYED_KEY)로 찾는다.
// 같은 청크에 묶인 다른 코드도 함께 세므로 실제보다 크게 잰다.

import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { gzipSync } from "node:zlib";

const LIMIT = 10 * 1024;
const MARKER = "hero-intro-played";
const DIR = ".next/static/chunks";

function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : full.endsWith(".js") ? [full] : [];
  });
}

let files;
try {
  files = walk(DIR);
} catch {
  console.error(`${DIR}가 없습니다. npm run build를 먼저 실행하세요.`);
  process.exit(1);
}

const chunks = files
  .map((file) => ({ file, text: readFileSync(file) }))
  .filter(({ text }) => text.includes(MARKER))
  .map(({ file, text }) => ({ file, gzip: gzipSync(text, { level: 9 }).length }));

if (chunks.length === 0) {
  console.error(`움직임 코드("${MARKER}")가 든 청크를 찾지 못했습니다.`);
  process.exit(1);
}

const total = chunks.reduce((sum, c) => sum + c.gzip, 0);
for (const c of chunks) console.log(`  ${c.file}  ${(c.gzip / 1024).toFixed(1)}KB`);
if (total > LIMIT) {
  console.error(`움직임 코드 용량 초과 - gzip ${(total / 1024).toFixed(1)}KB, 기준 ${LIMIT / 1024}KB`);
  process.exit(1);
}
console.log(`움직임 코드 용량 통과 - gzip ${(total / 1024).toFixed(1)}KB, 기준 ${LIMIT / 1024}KB`);
