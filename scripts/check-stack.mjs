#!/usr/bin/env node
// 기술 층 짝 확인 (ADR-0010)
//   npm run check:stack   세 서비스 폴더에서 표지를 찾아 content/site/home.md의 usedBy와 같은지 본다
// 서비스 폴더 경로는 .env.local로만 받는다. 표지는 scripts/stack.config.mjs에 있다.
// 경로가 없는 서비스는 건너뛴다. 서비스 코드가 없는 CI에서는 모두 건너뛰고 통과한다.

import { existsSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseFrontmatter } from "../src/lib/frontmatter.mjs";
import { compareStack, detectTechs, readService } from "./lib/stack.mjs";
import config from "./stack.config.mjs";

process.chdir(path.resolve(path.dirname(fileURLToPath(import.meta.url)), ".."));

function stop(message) {
  console.error(`기술 층 확인 실패 - ${message}`);
  process.exit(1);
}

if (existsSync(".env.local")) process.loadEnvFile(".env.local");
const { layers } = parseFrontmatter(readFileSync("content/site/home.md", "utf8")).data;

const detected = {};
const skipped = [];
for (const [slug, envName] of Object.entries(config.services)) {
  const dir = process.env[envName];
  if (!dir) {
    skipped.push(`${slug}(${envName} 없음)`);
    continue;
  }
  if (!existsSync(dir) || !statSync(dir).isDirectory()) stop(`${envName}가 가리키는 폴더가 없습니다 (${slug})`);
  detected[slug] = detectTechs(readService(dir, config.skipDirs), config.techs);
}

const problems = compareStack(layers, config.techs, detected);
if (problems.length) {
  for (const p of problems) console.error(`  ${p}`);
  stop(`${problems.length}건이 어긋납니다. 층 데이터나 표지를 고쳐 주세요.`);
}

const checked = Object.keys(detected);
if (!checked.length) console.log(`기술 층 확인 건너뜀 - 서비스 폴더 경로가 없습니다 (${skipped.join(", ")})`);
else console.log(`기술 층 확인 통과 - ${checked.join(", ")}${skipped.length ? `, 건너뜀: ${skipped.join(", ")}` : ""}`);
