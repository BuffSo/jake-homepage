import assert from "node:assert/strict";
import { test } from "node:test";
import { mask, scanText } from "./sensitive-rules.mjs";

// 검사에 걸리는 값이 파일에 그대로 있으면 저장소 검사에 걸리므로 실행할 때 만든다.
const PHONE = ["010", "0000", "0000"].join("-");
const PRIVATE_EMAIL = ["someone", "private.org"].join("@");

test("줄 번호와 규칙 이름을 돌려주고 값은 가린다", () => {
  const findings = scanText(`첫 줄\n연락처 ${PHONE}`);
  assert.deepEqual(findings, [{ line: 2, id: "phone-mobile", shown: mask(PHONE) }]);
  assert.ok(!findings[0].shown.includes(PHONE));
});

test("공개 연락처와 예시 이메일은 통과하고, 그 밖의 이메일은 걸린다", () => {
  assert.deepEqual(scanText("buff4701@gmail.com buffso@naver.com a@example.com"), []);
  assert.deepEqual(
    scanText(PRIVATE_EMAIL).map((f) => f.id),
    ["email"],
  );
});

test("비공개 금지어는 대소문자를 가리지 않고 찾고, 무엇이 걸렸는지는 출력하지 않는다", () => {
  const findings = scanText("Acme Corp 관련 메모", ["acme"]);
  assert.deepEqual(findings, [{ line: 1, id: "private-term#1", shown: "(비공개 목록)" }]);
});
