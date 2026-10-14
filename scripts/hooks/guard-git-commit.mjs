#!/usr/bin/env node
// Claude Code PreToolUse 훅 (ADR-0006)
// 에이전트가 git commit을 실행하기 직전에 민감정보 검사를 돌리고, 훅을 건너뛰는 커밋과 AI 서명이 든 커밋을 막는다.
// 종료 코드 2를 돌려주면 Claude Code가 명령을 실행하지 않고 stderr를 에이전트에게 전달한다.

import { spawnSync } from "node:child_process";

let raw = "";
for await (const chunk of process.stdin) raw += chunk;

const command = JSON.parse(raw || "{}").tool_input?.command ?? "";
if (!/\bgit\b[^;&|\n]*\bcommit\b/.test(command)) process.exit(0);

function block(message) {
  console.error(message);
  process.exit(2);
}

if (/--no-verify|\s-n(\s|$)/.test(command)) {
  block("훅을 건너뛰는 커밋(--no-verify, -n)은 허용하지 않습니다. 훅에 걸린 원인을 고치세요.");
}

if (/co-authored-by:.*(claude|anthropic)|generated with \[?claude/i.test(command)) {
  block("커밋 메시지에 AI 공동 작성자 줄이나 생성 도구 서명을 넣지 않습니다 (ADR-0006).");
}

const result = spawnSync("node", ["scripts/check-sensitive.mjs", "--staged"], {
  cwd: process.env.CLAUDE_PROJECT_DIR || process.cwd(),
  encoding: "utf8",
});

if (result.status !== 0) {
  block(`${result.stdout}${result.stderr}`.trim());
}

process.exit(0);
