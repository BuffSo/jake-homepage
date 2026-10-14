import assert from "node:assert/strict";
import { test } from "node:test";
import { scanUnits } from "./unit-rules.mjs";

test("손으로 쓴 px 값은 줄 번호와 함께 찾는다", () => {
  const css = ".title {\n  font-size: 76px;\n  margin: 0 1.5rem;\n}";
  assert.deepEqual(scanUnits(css), [{ line: 2, value: "76px" }]);
});

test("Tailwind 임의값의 px도 찾는다", () => {
  const tsx = '<h1 className="text-[76px] border-[1.5px]">';
  assert.deepEqual(
    scanUnits(tsx).map((f) => f.value),
    ["76px", "1.5px"],
  );
});

test("rem, 기본 유틸리티, 숫자 없는 px 유틸리티는 통과한다", () => {
  const tsx = '<div className="px-4 h-px border-2 text-[4.75rem] p-[0.5rem]">';
  assert.deepEqual(scanUnits(tsx), []);
});

test("px-ok 표시가 있는 줄과 주석 줄은 건너뛴다", () => {
  const ts = [
    'const sizes = "(max-width: 640px) 100vw"; // px-ok: next/image sizes',
    "// 스토리보드의 76px는 4.75rem",
    " * 16px = 1rem",
    "const gap = '12px';",
  ].join("\n");
  assert.deepEqual(scanUnits(ts), [{ line: 4, value: "12px" }]);
});

test("식별자 안의 숫자와 px는 값으로 보지 않는다", () => {
  assert.deepEqual(scanUnits("const icon16px = load(); const v = a.5px;"), []);
});
