#!/usr/bin/env node
// 검사 전부를 한 번에 돌린다 (docs/01-prd.md F6). npm run verify
// 실패해도 끝까지 돌리고, 마지막에 표로 요약한다. 실패가 하나라도 있으면 1로 끝난다.
// 검사 목록과 판단은 scripts/lib/verify.mjs에 있다.

import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { CHECKS, decide, exitCode, summarize } from "./lib/verify.mjs";

// 로컬 전용 검사의 경로는 .env.local에 있다 (sync, check:stack과 같은 방식). 이미 있는 값은 덮지 않는다.
if (existsSync(".env.local")) process.loadEnvFile(".env.local");

const results = [];
for (const check of CHECKS) {
  const { run, reason } = decide(check, process.env, results);
  if (!run) {
    console.log(`\n▶ ${check.name} 건너뜀 - ${reason}`);
    results.push({ ...check, status: "skip", reason });
    continue;
  }
  console.log(`\n▶ ${check.name} - ${check.command}`);
  const started = performance.now();
  const { status } = spawnSync(check.command, { shell: true, stdio: "inherit" });
  results.push({ ...check, status: status === 0 ? "pass" : "fail", seconds: (performance.now() - started) / 1000 });
}

console.log(`\n${summarize(results)}`);
process.exit(exitCode(results));
