#!/usr/bin/env node
// 주요 화면 캡처 확인 (docs/01-prd.md F6). E2E 뒤에 돌려 정한 캡처가 모두 생겼는지 본다.
// 캡처 테스트가 빠져도 E2E는 통과하므로 따로 확인한다. 목록은 scripts/lib/captures.mjs에 있다.

import { existsSync, readdirSync } from "node:fs";
import { CAPTURE_DIR, expectedCaptures, missingCaptures } from "./lib/captures.mjs";

const files = existsSync(CAPTURE_DIR) ? readdirSync(CAPTURE_DIR) : [];
const total = expectedCaptures().length;
const missing = missingCaptures(files);

if (missing.length === 0) {
  console.log(`화면 캡처 확인 통과 - ${total}장 (${CAPTURE_DIR}/)`);
  process.exit(0);
}

console.error(`화면 캡처 확인 실패 - ${total}장 중 ${missing.length}장이 없습니다`);
for (const file of missing) console.error(`  ${CAPTURE_DIR}/${file}`);
console.error("E2E의 캡처 테스트(e2e/*.spec.ts의 \"캡처를 남긴다\")가 돌았는지 확인합니다.");
process.exit(1);
