import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { outboundEvent } from "../../src/lib/outbound.mjs";

// 바깥 링크 클릭을 방문 통계 이벤트 값으로 바꾸는 함수 (src/lib/outbound.mjs, ADR-0012)

const HOME = "https://jakeso.dev/";

describe("outboundEvent", () => {
  test("다른 사이트로 가는 링크는 목적지 호스트와 누른 페이지를 돌려준다", () => {
    assert.deepEqual(outboundEvent("https://recueve.com/", HOME), { to: "recueve.com", from: "/" });
    assert.deepEqual(outboundEvent("https://github.com/BuffSo", "https://jakeso.dev/ai"), {
      to: "github.com/BuffSo",
      from: "/ai",
    });
    assert.deepEqual(outboundEvent("http://example.com/a", HOME), { to: "example.com/a", from: "/" });
  });

  test("목적지에서 쿼리, 해시, 끝의 /를 뗀다", () => {
    assert.deepEqual(outboundEvent("https://lotto.genys.kr/?ref=home#top", HOME), { to: "lotto.genys.kr", from: "/" });
    assert.deepEqual(outboundEvent("https://github.com/BuffSo/jake-homepage/", HOME), {
      to: "github.com/BuffSo/jake-homepage",
      from: "/",
    });
  });

  test("누른 페이지는 경로만 쓴다", () => {
    assert.equal(outboundEvent("https://recueve.com/", "https://jakeso.dev/ai/case?x=1#flow")?.from, "/ai/case");
  });

  test("이메일 링크는 주소 대신 email을 보낸다", () => {
    assert.deepEqual(outboundEvent("mailto:someone@example.com", "https://jakeso.dev/resume"), {
      to: "email",
      from: "/resume",
    });
  });

  test("사이트 안 링크와 다른 종류의 링크는 세지 않는다", () => {
    assert.equal(outboundEvent("https://jakeso.dev/work", HOME), null);
    assert.equal(outboundEvent("/work#recueve", HOME), null);
    assert.equal(outboundEvent("#about", HOME), null);
    assert.equal(outboundEvent("tel:123", HOME), null);
    assert.equal(outboundEvent("javascript:void(0)", HOME), null);
  });

  test("페이지 주소를 읽지 못하면 세지 않는다", () => {
    assert.equal(outboundEvent("https://recueve.com/", "not a url"), null);
  });

  test("값은 255자에서 자른다", () => {
    const long = `https://example.com/${"a".repeat(300)}`;
    assert.equal(outboundEvent(long, HOME)?.to.length, 255);
    assert.equal(outboundEvent("https://example.com/", `https://jakeso.dev/${"b".repeat(300)}`)?.from.length, 255);
  });
});
