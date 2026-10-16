// 저장소에서 세는 숫자(src/lib/repo-stats.mjs) 테스트. "이 사이트" 카드의 ADR 수와 CI 검사 수가 여기서 나온다.

import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { test } from "node:test";
import { countAdrs, countCiChecks } from "../../src/lib/repo-stats.mjs";

function fixture(files) {
  const root = mkdtempSync(path.join(tmpdir(), "repo-stats-"));
  for (const [file, text] of Object.entries(files)) {
    mkdirSync(path.dirname(path.join(root, file)), { recursive: true });
    writeFileSync(path.join(root, file), text);
  }
  return root;
}

test("ADR은 번호로 시작하는 md만 센다", () => {
  const root = fixture({
    "docs/adr/0001-first.md": "",
    "docs/adr/0002-second.md": "",
    "docs/adr/README.md": "",
    "docs/adr/template.md": "",
  });
  try {
    assert.equal(countAdrs(root), 2);
  } finally {
    rmSync(root, { recursive: true });
  }
});

test("CI 검사는 npm ci 뒤의 단계만 세고, 설치, 실패할 때만 도는 단계, 결과물 올리기는 빼고 센다", () => {
  const root = fixture({
    ".github/workflows/ci.yml": `
jobs:
  check:
    steps:
      - uses: actions/checkout@v7
      - run: npm ci
      - run: npm test
      - name: 브라우저 설치
        run: npx playwright install --with-deps chromium
      - run: npx playwright test
      - name: 캡처 올리기
        if: always()
        uses: actions/upload-artifact@v7
      - name: 보고서 올리기
        if: failure()
        uses: actions/upload-artifact@v7
`,
  });
  try {
    assert.equal(countCiChecks(root), 2);
  } finally {
    rmSync(root, { recursive: true });
  }
});

test("npm ci 단계가 없으면 알린다", () => {
  const root = fixture({ ".github/workflows/ci.yml": "jobs:\n  check:\n    steps:\n      - run: npm test\n" });
  try {
    assert.throws(() => countCiChecks(root), /npm ci/);
  } finally {
    rmSync(root, { recursive: true });
  }
});
