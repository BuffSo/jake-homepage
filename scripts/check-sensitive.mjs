#!/usr/bin/env node
// 민감정보 검사기 (ADR-0006)
//   node scripts/check-sensitive.mjs --staged   스테이징된 내용만 검사 (커밋 전 훅)
//   node scripts/check-sensitive.mjs --all      추적 중이거나 새로 추가될 파일 전체 검사 (CI)
// 규칙은 scripts/lib/sensitive-rules.mjs에 있다. 콘텐츠 동기화도 같은 규칙을 쓴다.

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { readPrivateTerms, scanText } from "./lib/sensitive-rules.mjs";

const staged = process.argv.includes("--staged");

const SKIP_FILES = [
  /(^|\/)package-lock\.json$/,
  /\.(png|jpe?g|gif|webp|avif|ico|svg|woff2?|ttf|otf|pdf|mp4|mov|webm|zip)$/i,
];

const privateTerms = readPrivateTerms() ?? [];

function git(args) {
  return execFileSync("git", args, { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
}

function listFiles() {
  const out = staged
    ? git(["diff", "--cached", "--name-only", "--diff-filter=ACMR", "-z"])
    : git(["ls-files", "-z", "--cached", "--others", "--exclude-standard"]);
  return out.split("\0").filter(Boolean);
}

function readContent(file) {
  if (staged) return git(["show", `:${file}`]);
  return existsSync(file) ? readFileSync(file, "utf8") : null;
}

const findings = [];
const files = listFiles().filter((f) => !SKIP_FILES.some((re) => re.test(f)));

for (const file of files) {
  const content = readContent(file);
  if (content == null || content.includes("\0")) continue;

  for (const { line, id, shown } of scanText(content, privateTerms)) {
    findings.push({ at: `${file}:${line}`, id, shown });
  }
}

const scope = staged ? "스테이징된 파일" : "전체 파일";
if (findings.length === 0) {
  console.log(`민감정보 검사 통과 - ${scope} ${files.length}개, 금지어 ${privateTerms.length}개 적용`);
  process.exit(0);
}

console.error(`민감정보 검사 실패 - ${scope} ${files.length}개 중 ${findings.length}건`);
for (const f of findings) console.error(`  ${f.at}  [${f.id}]  ${f.shown}`);
console.error("값을 지운 뒤 다시 시도하세요. 규칙을 끄거나 예외를 늘려서 통과시키지 않습니다 (ADR-0006).");
process.exit(1);
