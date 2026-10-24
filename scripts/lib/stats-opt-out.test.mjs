import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { statsDecision } from "../../src/lib/stats-opt-out.mjs";

// 운영자 본인의 방문을 방문 통계에서 빼는 규칙 (src/lib/stats-opt-out.mjs, ADR-0012)

const HOME = "https://jakeso.dev/";

describe("statsDecision", () => {
  test("표시가 없는 브라우저의 방문은 보낸다", () => {
    assert.deepEqual(statsDecision(HOME, false), { optedOut: false, send: true });
    assert.deepEqual(statsDecision("https://jakeso.dev/work?x=1#recueve", false), { optedOut: false, send: true });
  });

  test("표시가 있는 브라우저의 방문은 보내지 않는다", () => {
    assert.deepEqual(statsDecision(HOME, true), { optedOut: true, send: false });
    assert.deepEqual(statsDecision("https://jakeso.dev/ai/case", true), { optedOut: true, send: false });
  });

  test("stats=off로 열면 표시를 남기고 그 방문도 보내지 않는다", () => {
    assert.deepEqual(statsDecision("https://jakeso.dev/?stats=off", false), { optedOut: true, send: false });
    assert.deepEqual(statsDecision("https://jakeso.dev/?stats=off", true), { optedOut: true, send: false });
    assert.deepEqual(statsDecision("https://jakeso.dev/work?a=1&stats=off#top", false), { optedOut: true, send: false });
  });

  test("stats=on으로 열면 표시를 지우고 그 방문은 보내지 않는다", () => {
    assert.deepEqual(statsDecision("https://jakeso.dev/?stats=on", true), { optedOut: false, send: false });
    assert.deepEqual(statsDecision("https://jakeso.dev/?stats=on", false), { optedOut: false, send: false });
  });

  test("값은 대소문자를 가리지 않는다", () => {
    assert.deepEqual(statsDecision("https://jakeso.dev/?stats=OFF", false), { optedOut: true, send: false });
    assert.deepEqual(statsDecision("https://jakeso.dev/?stats=On", true), { optedOut: false, send: false });
  });

  test("다른 값이면 표시를 그대로 둔다", () => {
    assert.deepEqual(statsDecision("https://jakeso.dev/?stats=1", false), { optedOut: false, send: true });
    assert.deepEqual(statsDecision("https://jakeso.dev/?stats=", true), { optedOut: true, send: false });
    assert.deepEqual(statsDecision("https://jakeso.dev/?status=off", false), { optedOut: false, send: true });
  });

  test("주소를 읽지 못하면 표시를 그대로 둔다", () => {
    assert.deepEqual(statsDecision("not a url", false), { optedOut: false, send: true });
    assert.deepEqual(statsDecision("not a url", true), { optedOut: true, send: false });
  });
});
