#!/usr/bin/env node
// 길이 단위 검사기 (docs/03-design.md 원칙 7)
//   node scripts/check-units.mjs --staged   스테이징된 내용만 검사 (커밋 전 훅)
//   node scripts/check-units.mjs --all      추적 중이거나 새로 추가될 파일 전체 검사 (CI)
// 규칙은 scripts/lib/unit-rules.mjs에 있다.

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { ALLOW_MARK, scanUnits } from "./lib/unit-rules.mjs";

const staged = process.argv.includes("--staged");
const TARGET = /^src\/.*\.(css|tsx?|mjs|js)$/;

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
const files = listFiles().filter((f) => TARGET.test(f));

for (const file of files) {
  const content = readContent(file);
  if (content == null) continue;
  for (const { line, value } of scanUnits(content)) {
    findings.push(`${file}:${line}  ${value}`);
  }
}

const scope = staged ? "스테이징된 파일" : "전체 파일";
if (findings.length === 0) {
  console.log(`단위 검사 통과 - ${scope} ${files.length}개`);
  process.exit(0);
}

console.error(`단위 검사 실패 - ${scope} ${files.length}개 중 ${findings.length}건`);
for (const f of findings) console.error(`  ${f}`);
console.error(
  `길이는 rem으로, 테두리는 border·border-2 유틸리티로 씁니다. px 숫자가 꼭 필요한 줄만 ${ALLOW_MARK} 표시를 답니다 (03-design.md 원칙 7).`,
);
process.exit(1);
