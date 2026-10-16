// 저장소에서 바로 세는 숫자. 글에 적어 두면 금방 틀리므로 빌드할 때 센다.
// 사이트(src/lib/content.ts)와 테스트(scripts/lib/content.test.mjs)가 같이 쓴다.

import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { parse } from "yaml";

/** docs/adr/의 ADR 파일 수 (0001-제목.md 형식) */
export function countAdrs(root) {
  return readdirSync(path.join(root, "docs/adr")).filter((f) => /^\d{4}-.+\.md$/.test(f)).length;
}

/**
 * CI에서 npm ci 뒤에 도는 검사 단계.
 * 브라우저 설치 같은 준비 단계, 실패했을 때만 도는 단계(보고서 올리기), 결과물 올리기(화면 캡처)는 검사가 아니라서 뺀다.
 * npm run verify의 검사 목록과 같은지도 이 목록으로 확인한다 (scripts/lib/verify.test.mjs).
 */
export function ciCheckSteps(root) {
  const workflow = parse(readFileSync(path.join(root, ".github/workflows/ci.yml"), "utf8"));
  const steps = Object.values(workflow.jobs).flatMap((job) => job.steps ?? []);
  const start = steps.findIndex((s) => s.run === "npm ci");
  if (start < 0) throw new Error("ci.yml에서 npm ci 단계를 찾지 못했습니다");
  const isSetup = (s) => /\binstall\b/.test(`${s.name ?? ""} ${s.run ?? ""}`);
  const onFailureOnly = (s) => /failure\(\)/.test(`${s.if ?? ""}`);
  const isUpload = (s) => /^actions\/upload-artifact@/.test(s.uses ?? "");
  return steps.slice(start + 1).filter((s) => !isSetup(s) && !onFailureOnly(s) && !isUpload(s));
}

/** CI 검사 단계 수. "이 사이트" 카드의 숫자다. */
export function countCiChecks(root) {
  return ciCheckSteps(root).length;
}
