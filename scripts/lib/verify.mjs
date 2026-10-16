// npm run verify의 검사 목록과 판단 (docs/01-prd.md F6)
// 실행은 scripts/verify.mjs가 한다. 여기에는 테스트할 수 있는 순수 함수만 둔다.

/**
 * 돌리는 순서. command는 CI(.github/workflows/ci.yml)의 run과 같은 문자열로 쓴다.
 * 두 목록이 같은지는 scripts/lib/verify.test.mjs가 확인한다.
 * needsEnv: 로컬에만 있는 경로. 하나도 없으면 건너뛴다(기술 층은 경로가 있는 서비스만 대조한다).
 * after: 이 검사가 통과해야 돌린다.
 */
export const CHECKS = [
  { id: "sensitive", name: "민감정보 검사", command: "npm run check:sensitive" },
  { id: "units", name: "길이 단위 검사", command: "npm run check:units" },
  { id: "test", name: "스크립트 테스트", command: "npm test" },
  { id: "lint", name: "린트", command: "npm run lint" },
  { id: "typecheck", name: "타입 검사", command: "npm run typecheck" },
  { id: "sync", name: "동기화 확인", command: "npm run sync -- --check", needsEnv: ["CAREER_DIR"] },
  {
    id: "stack",
    name: "기술 층 확인",
    command: "npm run check:stack",
    needsEnv: ["RECUEVE_DIR", "PROWITH_DIR", "LOTTO_DIR"],
  },
  { id: "build", name: "빌드", command: "npm run build" },
  { id: "motion", name: "움직임 코드 용량", command: "npm run check:motion-size", after: "build" },
  { id: "e2e", name: "화면 검사 (E2E)", command: "npx playwright test", after: "build" },
];

/** 로컬 전용 검사의 명령. 경로가 없는 CI에는 단계로 두지 않는다. */
export const LOCAL_ONLY = CHECKS.filter((check) => check.needsEnv).map((check) => check.command);

/** 검사를 돌릴지 정한다. 건너뛰면 이유를 함께 돌려준다. results는 앞서 끝난 검사의 결과다. */
export function decide(check, env, results) {
  if (check.needsEnv && !check.needsEnv.some((key) => env[key])) {
    return { run: false, reason: `경로 없음 (${check.needsEnv.join(", ")})` };
  }
  if (check.after) {
    const before = results.find((result) => result.id === check.after);
    if (before?.status !== "pass") return { run: false, reason: `${before?.name ?? check.after} 실패` };
  }
  return { run: true };
}

const LABEL = { pass: "통과", fail: "실패", skip: "건너뜀" };

/** 마지막에 찍는 요약 표. PR의 테스트 체크리스트에 그대로 붙일 수 있게 마크다운 표로 쓴다. */
export function summarize(results) {
  const rows = results.map((result) => {
    const status = result.status === "skip" ? `${LABEL.skip} - ${result.reason}` : LABEL[result.status];
    const time = result.seconds === undefined ? "-" : `${result.seconds.toFixed(1)}초`;
    return `| ${result.name} | ${status} | ${time} |`;
  });
  const count = (status) => results.filter((result) => result.status === status).length;
  return [
    "| 검사 | 결과 | 시간 |",
    "|---|---|---|",
    ...rows,
    "",
    `${results.length}개 중 통과 ${count("pass")}, 실패 ${count("fail")}, 건너뜀 ${count("skip")}`,
  ].join("\n");
}

/** 실패가 하나라도 있으면 1. 건너뜀은 실패가 아니다. */
export function exitCode(results) {
  return results.some((result) => result.status === "fail") ? 1 : 0;
}
