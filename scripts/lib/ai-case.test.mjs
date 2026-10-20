// AI 도구 활용 사례 읽기(src/lib/ai-case.mjs) 테스트

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, test } from "node:test";
import { AiCaseError, firstSentence, panelBox, parseAiCase, PANEL_INSET } from "../../src/lib/ai-case.mjs";

const ROOT = process.cwd();
const panel = (i) => ({ src: "4컷.png", crop: [10 * i, 0, 100, 100], caption: `${i + 1}번 설명` });
const DATA = { title: "사례", subtitle: "부제", panels: [0, 1, 2, 3].map(panel), heading: "본문 제목" };
const json = (patch = {}) => JSON.stringify({ ...DATA, ...patch });

describe("parseAiCase", () => {
  test("제목, 부제, 4컷, 본문 제목과 빈 줄로 나눈 문단을 돌려준다", () => {
    const out = parseAiCase(json(), "첫 문단입니다.\r\n\r\n둘째 문단입니다.\n\n\n셋째\n");
    assert.equal(out.title, "사례");
    assert.equal(out.subtitle, "부제");
    assert.equal(out.heading, "본문 제목");
    assert.deepEqual(out.panels[1], { crop: [10, 0, 100, 100], caption: "2번 설명" });
    assert.deepEqual(out.body, ["첫 문단입니다.", "둘째 문단입니다.", "셋째"]);
  });

  test("부제에 작성자 이름(|)이 남아 있으면 멈춘다", () => {
    assert.throws(() => parseAiCase(json({ subtitle: "부제  |  이름" }), "본문"), AiCaseError);
  });

  test("칸이 넷이 아니거나 자리와 설명이 이상하면 멈춘다", () => {
    assert.throws(() => parseAiCase(json({ panels: DATA.panels.slice(0, 3) }), "본문"), AiCaseError);
    const bad = (p) => json({ panels: [p, ...DATA.panels.slice(1)] });
    assert.throws(() => parseAiCase(bad({ crop: [0, 0, 100], caption: "x" }), "본문"), AiCaseError);
    assert.throws(() => parseAiCase(bad({ crop: [0, 0, 100, "100"], caption: "x" }), "본문"), AiCaseError);
    assert.throws(() => parseAiCase(bad({ crop: [0, 0, 100, 100], caption: " " }), "본문"), AiCaseError);
  });

  test("json이 깨졌거나 제목이 없거나 본문이 비면 멈춘다", () => {
    assert.throws(() => parseAiCase("{", "본문"), AiCaseError);
    assert.throws(() => parseAiCase(json({ title: "" }), "본문"), AiCaseError);
    assert.throws(() => parseAiCase(json(), "\n\n"), AiCaseError);
  });
});

test("firstSentence는 마침표 뒤가 공백이나 끝일 때만 자른다", () => {
  assert.equal(firstSentence("올라갑니다. 구현은 빨라졌습니다."), "올라갑니다.");
  assert.equal(firstSentence("버전 1.5를 씁니다. 다음 문장."), "버전 1.5를 씁니다.");
  assert.equal(firstSentence("마침표 없는 문장"), "마침표 없는 문장");
});

describe("panelBox", () => {
  test("안쪽으로 줄인 칸이 상자를 꽉 채우도록 그림의 크기와 위치를 %로 준다", () => {
    const box = panelBox([100, 200, 216, 116], { width: 1000, height: 1000 });
    const [w, h] = [216 - 2 * PANEL_INSET, 116 - 2 * PANEL_INSET];
    assert.equal(box.aspectRatio, `${w} / ${h}`);
    assert.equal(box.width, "500%");
    assert.equal(box.height, "1000%");
    assert.equal(box.left, `${-((100 + PANEL_INSET) / w) * 100}%`);
    assert.equal(box.top, `${-((200 + PANEL_INSET) / h) * 100}%`);
  });

  test("자리가 그림 밖으로 나가면 멈춘다", () => {
    assert.throws(() => panelBox([900, 0, 200, 200], { width: 1000, height: 1000 }), AiCaseError);
  });
});

test("동기화한 사례가 읽히고, 네 칸의 자리가 동기화한 그림 안에 있다", () => {
  const dir = path.join(ROOT, "content/synced");
  const aiCase = parseAiCase(readFileSync(path.join(dir, "ai-case.json"), "utf8"), readFileSync(path.join(dir, "ai-case.txt"), "utf8"));
  // PNG의 IHDR에서 폭과 높이를 읽는다(16~23바이트).
  const png = readFileSync(path.join(dir, "ai-case.png"));
  const image = { width: png.readUInt32BE(16), height: png.readUInt32BE(20) };
  for (const { crop } of aiCase.panels) assert.doesNotThrow(() => panelBox(crop, image));
});
