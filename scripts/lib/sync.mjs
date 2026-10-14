// 콘텐츠 동기화의 핵심 (ADR-0003 구현 원칙)
// 원본을 읽고, 변환하고, 민감정보를 검사해서 쓸 파일을 메모리에 만든다.
// 파일을 쓰거나 비교하는 일은 scripts/sync-content.mjs가 한다.

import { execFileSync } from "node:child_process";
import { readFileSync, realpathSync, statSync } from "node:fs";
import path from "node:path";
import { scanText } from "./sensitive-rules.mjs";

export const MANIFEST = "manifest.json";

// 이 모듈이 던지는 오류. 메시지에는 원본 내용과 로컬 경로를 넣지 않는다.
export class SyncError extends Error {}

// ---------- 변환 ----------

function isTableRow(line) {
  return line.trim().startsWith("|");
}

// 앞뒤의 |를 떼고 칸으로 나눈다. \|는 칸 구분으로 보지 않는다.
function splitRow(line) {
  const indent = line.match(/^\s*/)[0];
  const body = line.trim().replace(/^\|/, "").replace(/\|$/, "");
  return { indent, cells: body.split(/(?<!\\)\|/) };
}

function isSeparatorRow(line) {
  return isTableRow(line) && splitRow(line).cells.every((c) => /^\s*:?-+:?\s*$/.test(c));
}

// 머리글이 header인 열을 머리글, 구분선, 값까지 통째로 지운다. 남는 칸이 없으면 그 줄을 지운다.
export function dropTableColumn(text, header) {
  const lines = text.split("\n");
  let found = 0;

  for (let i = 0; i < lines.length - 1; i++) {
    if (!isTableRow(lines[i]) || !isSeparatorRow(lines[i + 1])) continue;
    const col = splitRow(lines[i]).cells.findIndex((c) => c.trim() === header);
    if (col === -1) continue;

    found++;
    let j = i;
    for (; j < lines.length && isTableRow(lines[j]); j++) {
      const { indent, cells } = splitRow(lines[j]);
      cells.splice(col, 1);
      lines[j] = cells.length ? `${indent}|${cells.join("|")}|` : null;
    }
    i = j - 1;
  }

  if (found === 0) throw new SyncError(`표 머리글 "${header}"를 찾지 못했습니다`);
  return lines.filter((l) => l !== null).join("\n");
}

// prefix로 시작하는 줄을 지운다(앞쪽 공백은 무시).
export function dropLine(text, prefix) {
  const lines = text.split("\n");
  const kept = lines.filter((l) => !l.trimStart().startsWith(prefix));
  if (kept.length === lines.length) throw new SyncError(`"${prefix}"로 시작하는 줄을 찾지 못했습니다`);
  return kept.join("\n");
}

// prefix로 시작하는 줄 하나를 replacement로 바꾼다. 들여쓰기는 원본 것을 지킨다.
// 엉뚱한 줄까지 바꾸지 않도록 정확히 한 줄만 맞아야 한다.
export function replaceLine(text, prefix, replacement) {
  if (typeof replacement !== "string") throw new SyncError(`"${prefix}" 규칙에 바꿀 문구(with)가 없습니다`);
  const lines = text.split("\n");
  const hits = lines.flatMap((l, i) => (l.trimStart().startsWith(prefix) ? [i] : []));
  if (hits.length !== 1) {
    throw new SyncError(`"${prefix}"로 시작하는 줄이 한 줄이어야 하는데 ${hits.length}줄입니다`);
  }
  const i = hits[0];
  lines[i] = `${lines[i].match(/^\s*/)[0]}${replacement}`;
  return lines.join("\n");
}

const TRANSFORMS = {
  "drop-table-column": { run: (text, t) => dropTableColumn(text, t.header), target: (t) => t.header },
  "drop-line": { run: (text, t) => dropLine(text, t.startsWith), target: (t) => t.startsWith },
  "replace-line": { run: (text, t) => replaceLine(text, t.startsWith, t.with), target: (t) => t.startsWith },
};

function transformOf(t) {
  const impl = TRANSFORMS[t.type];
  if (!impl) throw new SyncError(`알 수 없는 변환입니다: ${t.type}`);
  return impl;
}

export function applyTransforms(text, transforms) {
  return transforms.reduce((acc, t) => transformOf(t).run(acc, t), text);
}

function describeTransform(t) {
  return `${t.type} ${transformOf(t).target(t)}`;
}

// ---------- 설정과 원본 ----------

function isPlainRelative(p) {
  return typeof p === "string" && p !== "" && !path.isAbsolute(p) && !p.split(/[\\/]/).includes("..");
}

export function validateConfig(config) {
  if (!isPlainRelative(config.outputDir)) throw new SyncError("outputDir는 저장소 안의 상대 경로여야 합니다");
  const outputs = new Set();
  for (const f of config.files) {
    if (!isPlainRelative(f.source)) {
      throw new SyncError(`허용 목록의 경로는 원본 저장소 안의 상대 경로여야 합니다: ${f.source}`);
    }
    if (!/^[a-z0-9-]+\.md$/.test(f.output) || f.output === MANIFEST || outputs.has(f.output)) {
      throw new SyncError(`출력 파일 이름이 올바르지 않거나 겹칩니다: ${f.output}`);
    }
    outputs.add(f.output);
    f.transforms.forEach(transformOf);
  }
}

// 허용 목록의 파일을 정확한 경로로 찾는다. 없거나, 파일이 아니거나, 링크로 원본 저장소 밖을 가리키면 멈춘다.
function resolveSource(root, source) {
  let real;
  try {
    real = realpathSync(path.join(root, source));
  } catch {
    throw new SyncError(`원본 파일이 없습니다: ${source}`);
  }
  if (!real.startsWith(root + path.sep)) throw new SyncError(`원본 저장소 밖을 가리킵니다: ${source}`);
  if (!statSync(real).isFile()) throw new SyncError(`파일이 아닙니다: ${source}`);
  return real;
}

function git(root, args) {
  try {
    return execFileSync("git", ["-C", root, ...args], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    }).trim();
  } catch {
    throw new SyncError(`원본 저장소에서 git ${args[0]} 명령이 실패했습니다`);
  }
}

// 원본 커밋은 허용 목록의 파일을 마지막으로 바꾼 커밋이다. 다른 파일만 바뀐 커밋으로는 달라지지 않는다.
// git status도 허용 목록의 파일에만 묻는다.
function sourceState(root, sources) {
  const commit = git(root, ["log", "-1", "--format=%H", "--", ...sources]);
  if (!commit) throw new SyncError("허용 목록의 파일이 원본 저장소에 커밋된 적이 없습니다");
  const dirty = sources.filter((s) => git(root, ["status", "--porcelain", "--", s]) !== "");
  return { commit, dirty };
}

// ---------- 결과 만들기 ----------

// 쓸 파일(Map: 이름 → 내용)과 민감정보 검사 결과를 돌려준다. 파일은 쓰지 않는다.
export function buildOutputs({ careerDir, config, privateTerms, allowDirty = false }) {
  validateConfig(config);

  let root;
  try {
    root = realpathSync(careerDir);
  } catch {
    throw new SyncError("CAREER_DIR 폴더가 없습니다");
  }

  const reals = config.files.map((f) => resolveSource(root, f.source));
  const state = sourceState(root, config.files.map((f) => f.source));
  if (state.dirty.length && !allowDirty) {
    throw new SyncError(
      `원본에 커밋하지 않은 변경이 있습니다: ${state.dirty.join(", ")}. ` +
        "원본 저장소에서 먼저 커밋해 주세요. 미리 보기만 하려면 --allow-dirty를 붙입니다.",
    );
  }

  const outputs = new Map();
  config.files.forEach((f, i) => {
    try {
      outputs.set(f.output, applyTransforms(readFileSync(reals[i], "utf8"), f.transforms));
    } catch (e) {
      if (e instanceof SyncError) throw new SyncError(`${f.output}: ${e.message}`);
      throw e;
    }
  });

  // 원본 파일의 해시와 경로는 적지 않는다. 결과와 원본은 지운 값만 다르므로 원본 해시가 있으면 값을 대입해 맞춰 볼 수 있다.
  const manifest = {
    source: { commit: state.commit, dirty: state.dirty.length > 0 },
    files: config.files.map((f) => ({ output: f.output, transforms: f.transforms.map(describeTransform) })),
  };
  outputs.set(MANIFEST, `${JSON.stringify(manifest, null, 2)}\n`);

  const findings = [];
  for (const [name, content] of outputs) {
    for (const { line, id, shown } of scanText(content, privateTerms)) {
      findings.push({ at: `${name}:${line}`, id, shown });
    }
  }

  return { outputs, findings, state };
}
