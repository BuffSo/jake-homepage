// 주요 화면 캡처 목록(scripts/lib/captures.mjs) 테스트

import assert from "node:assert/strict";
import { test } from "node:test";
import { expectedCaptures, missingCaptures } from "./captures.mjs";

test("다섯 페이지의 라이트와 다크, 이력서 인쇄를 두 폭으로 찍어 22장이다", () => {
  const files = expectedCaptures();
  assert.equal(files.length, 22);
  assert.ok(files.includes("ai-dark-375.png"));
  assert.ok(files.includes("ai-case-light-1280.png"));
  assert.ok(files.includes("resume-print-1280.png"));
});

test("빠진 캡처만 돌려주고, 목록에 없는 파일은 무시한다", () => {
  const files = expectedCaptures().filter((file) => file !== "home-light-375.png");
  assert.deepEqual(missingCaptures([...files, "extra.png"]), ["home-light-375.png"]);
  assert.deepEqual(missingCaptures(expectedCaptures()), []);
  assert.equal(missingCaptures([]).length, 22);
});
