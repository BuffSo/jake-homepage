// 저장소에서 바로 세는 숫자. 글에 적어 두면 금방 틀리므로 빌드할 때 센다.
// 사이트(src/lib/content.ts)와 테스트(scripts/lib/content.test.mjs)가 같이 쓴다.

import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { parse } from "yaml";

/** docs/adr/의 ADR 파일 수 (0001-제목.md 형식) */
export function countAdrs(root) {
  return readdirSync(path.join(root, "docs/adr")).filter((f) => /^\d{4}-.+\.md$/.test(f)).length;
}

/** CI에서 npm ci 뒤에 도는 검사 단계 수. 브라우저 설치 같은 준비 단계는 세지 않는다. */
export function countCiChecks(root) {
  const workflow = parse(readFileSync(path.join(root, ".github/workflows/ci.yml"), "utf8"));
  const steps = Object.values(workflow.jobs).flatMap((job) => job.steps ?? []);
  const start = steps.findIndex((s) => s.run === "npm ci");
  if (start < 0) throw new Error("ci.yml에서 npm ci 단계를 찾지 못했습니다");
  return steps.slice(start + 1).filter((s) => !/\binstall\b/.test(`${s.name ?? ""} ${s.run ?? ""}`)).length;
}
