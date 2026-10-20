#!/usr/bin/env node
// 콘텐츠 동기화 (F5, ADR-0003)
//   npm run sync                    원본 저장소에서 허용 목록의 파일만 가져와 content/synced/에 쓴다
//   npm run sync -- --check         파일을 쓰지 않고 content/synced/가 원본에서 다시 만든 결과와 같은지만 본다
//   npm run sync -- --allow-dirty   원본에 커밋하지 않은 변경이 있어도 실행한다(미리 보기용, manifest에 남는다)
// 원본 저장소 경로는 .env.local의 CAREER_DIR로만 받는다. 허용 목록은 scripts/sync.config.mjs에 있다.

import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PRIVATE_TERMS_FILE, readPrivateTerms } from "./lib/sensitive-rules.mjs";
import { buildOutputs, sameContent, SyncError } from "./lib/sync.mjs";
import config from "./sync.config.mjs";

process.chdir(path.resolve(path.dirname(fileURLToPath(import.meta.url)), ".."));

const check = process.argv.includes("--check");
const allowDirty = process.argv.includes("--allow-dirty");

function stop(message) {
  console.error(`동기화 중단 - ${message}`);
  process.exit(1);
}

function compare(outputs) {
  const dir = config.outputDir;
  const diffs = [];
  for (const [name, content] of outputs) {
    const file = path.join(dir, name);
    if (!existsSync(file)) diffs.push(`${name}: 없음`);
    else if (!sameContent(readFileSync(file), content)) diffs.push(`${name}: 원본과 다름`);
  }
  for (const name of existsSync(dir) ? readdirSync(dir) : []) {
    if (!outputs.has(name)) diffs.push(`${name}: 허용 목록에 없음`);
  }
  return diffs;
}

function main() {
  if (existsSync(".env.local")) process.loadEnvFile(".env.local");
  const careerDir = process.env.CAREER_DIR;
  if (!careerDir) stop("CAREER_DIR가 없습니다. .env.local에 원본 저장소 경로를 적어 주세요.");

  const privateTerms = readPrivateTerms();
  if (privateTerms === null) {
    stop(`${PRIVATE_TERMS_FILE} 파일이 없습니다. 금지어가 없다면 빈 파일이라도 만들어 주세요 (ADR-0003).`);
  }

  const { outputs, findings, state } = buildOutputs({ careerDir, config, privateTerms, allowDirty });

  if (findings.length) {
    for (const f of findings) console.error(`  ${f.at}  [${f.id}]  ${f.shown}`);
    stop(`민감정보 ${findings.length}건이 남아 있어 아무 파일도 쓰지 않았습니다.`);
  }

  if (check) {
    const diffs = compare(outputs);
    if (diffs.length) {
      for (const d of diffs) console.error(`  ${d}`);
      stop(`${config.outputDir}/가 원본과 다릅니다. npm run sync로 다시 가져와 주세요.`);
    }
    console.log(`동기화 확인 통과 - ${config.outputDir}/가 원본과 같습니다`);
    return;
  }

  rmSync(config.outputDir, { recursive: true, force: true });
  mkdirSync(config.outputDir, { recursive: true });
  for (const [name, content] of outputs) writeFileSync(path.join(config.outputDir, name), content);

  const dirtyNote = state.dirty.length ? ", 커밋하지 않은 변경 포함(--allow-dirty)" : "";
  console.log(`동기화 완료 - 원본 커밋 ${state.commit.slice(0, 7)}${dirtyNote}`);
  for (const f of config.files) {
    const applied = f.transforms.map((t) => t.type).join(", ") || "변환 없음";
    console.log(`  ${config.outputDir}/${f.output}  (${applied})`);
  }

  // 쓴 결과까지 포함해 저장소 전체를 한 번 더 검사한다.
  try {
    execFileSync(process.execPath, ["scripts/check-sensitive.mjs", "--all"], { stdio: "inherit" });
  } catch {
    process.exit(1);
  }
}

try {
  main();
} catch (e) {
  if (e instanceof SyncError) stop(e.message);
  stop(`예상하지 못한 오류 (${e.code ?? e.name}): ${e.message}`);
}
