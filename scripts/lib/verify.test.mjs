// npm run verify의 검사 목록과 판단(scripts/lib/verify.mjs) 테스트

import assert from "node:assert/strict";
import { test } from "node:test";
import { ciCheckSteps } from "../../src/lib/repo-stats.mjs";
import { CHECKS, LOCAL_ONLY, decide, exitCode, summarize } from "./verify.mjs";

const ROOT = process.cwd();
const byId = (id) => CHECKS.find((check) => check.id === id);
const pass = (id) => ({ ...byId(id), status: "pass", seconds: 1 });
const fail = (id) => ({ ...byId(id), status: "fail", seconds: 1 });

test("검사 열 개를 정한 순서로 돈다", () => {
  assert.deepEqual(
    CHECKS.map((check) => check.id),
    ["sensitive", "units", "test", "lint", "typecheck", "sync", "stack", "build", "motion", "e2e"],
  );
});

test("로컬 전용 검사는 경로가 없으면 건너뛴다", () => {
  assert.deepEqual(decide(byId("sync"), {}, []), { run: false, reason: "경로 없음 (CAREER_DIR)" });
  assert.deepEqual(decide(byId("sync"), { CAREER_DIR: "" }, []).run, false);
  assert.deepEqual(decide(byId("sync"), { CAREER_DIR: "/career" }, []), { run: true });
  assert.equal(decide(byId("stack"), {}, []).run, false);
  // 기술 층은 경로가 있는 서비스만 대조하므로 하나만 있어도 돈다
  assert.deepEqual(decide(byId("stack"), { LOTTO_DIR: "/lotto" }, []), { run: true });
});

test("빌드가 실패하면 빌드에 기대는 검사만 건너뛴다", () => {
  const results = [pass("sensitive"), pass("units"), pass("test"), pass("lint"), pass("typecheck"), fail("build")];
  assert.deepEqual(decide(byId("motion"), {}, results), { run: false, reason: "빌드 실패" });
  assert.deepEqual(decide(byId("e2e"), {}, results), { run: false, reason: "빌드 실패" });
  assert.deepEqual(decide(byId("lint"), {}, [fail("test")]), { run: true });
  assert.deepEqual(decide(byId("e2e"), {}, [pass("build")]), { run: true });
});

test("실패가 하나라도 있으면 1로 끝나고, 건너뜀은 실패가 아니다", () => {
  const skipped = { ...byId("sync"), status: "skip", reason: "경로 없음 (CAREER_DIR)" };
  assert.equal(exitCode([pass("test"), skipped]), 0);
  assert.equal(exitCode([pass("test"), skipped, fail("lint")]), 1);
});

test("요약 표에 결과, 건너뛴 이유, 시간과 개수가 나온다", () => {
  const skipped = { ...byId("sync"), status: "skip", reason: "경로 없음 (CAREER_DIR)" };
  const text = summarize([{ ...pass("test"), seconds: 2.345 }, fail("lint"), skipped]);
  assert.match(text, /^\| 검사 \| 결과 \| 시간 \|$/m);
  assert.match(text, /^\| 스크립트 테스트 \| 통과 \| 2\.3초 \|$/m);
  assert.match(text, /^\| 린트 \| 실패 \| 1\.0초 \|$/m);
  assert.match(text, /^\| 동기화 확인 \| 건너뜀 - 경로 없음 \(CAREER_DIR\) \| - \|$/m);
  assert.match(text, /3개 중 통과 1, 실패 1, 건너뜀 1$/);
});

test("CI 단계는 verify의 검사에서 로컬 전용 둘을 뺀 것과 같고, CI에만 있는 것은 gitleaks뿐이다", () => {
  const steps = ciCheckSteps(ROOT);
  const ciCommands = steps.filter((step) => step.run).map((step) => step.run);
  const verifyCommands = CHECKS.map((check) => check.command).filter((command) => !LOCAL_ONLY.includes(command));
  assert.deepEqual(ciCommands, verifyCommands);
  assert.deepEqual(
    steps.filter((step) => !step.run).map((step) => step.uses.split("@")[0]),
    ["gitleaks/gitleaks-action"],
  );
});
