import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { rehypeDropStyle, rehypeHeadingIds, remarkSoftBreaks } from "../../src/lib/markdown-plugins.mjs";

// 원문 마크다운 플러그인 (src/lib/markdown-plugins.mjs). 사이트와 같은 react-markdown으로 그려 HTML을 본다.

const render = (md, { remark = [], rehype = [] } = {}) =>
  renderToStaticMarkup(
    createElement(Markdown, { remarkPlugins: [remarkGfm, ...remark], rehypePlugins: rehype }, md),
  );

describe("remarkSoftBreaks", () => {
  test("문단 안의 줄바꿈을 <br>로 그린다", () => {
    const html = render("첫 줄\n둘째 줄\n셋째 줄", { remark: [remarkSoftBreaks] });
    assert.equal((html.match(/<br\/>/g) ?? []).length, 2);
  });

  test("인용 안의 줄바꿈과 굵은 글자 뒤의 줄바꿈도 살린다", () => {
    const html = render('> "하나"\n> "둘"\n\n**이름**\n다음 줄', { remark: [remarkSoftBreaks] });
    assert.equal((html.match(/<br\/>/g) ?? []).length, 2);
  });

  test("목록, 표, 코드 블록에는 줄바꿈을 더하지 않는다", () => {
    const md = ["- 하나", "  - 안쪽", "- 둘", "", "| 가 | 나 |", "| --- | --- |", "| 1 | 2 |", "", "```", "a", "b", "```"].join("\n");
    assert.equal(render(md, { remark: [remarkSoftBreaks] }), render(md));
  });

  test("쓰지 않으면 줄바꿈이 한 문단으로 붙는다 (/work는 그대로)", () => {
    assert.ok(!render("첫 줄\n둘째 줄").includes("<br/>"));
  });
});

describe("rehypeHeadingIds", () => {
  const ids = { 연락처: "contact", "강의·특강": "talks" };

  test("절 제목(h2)에 정해 둔 id를 붙인다", () => {
    const html = render("## 연락처\n\n## 강의·특강\n\n### 소제목", { rehype: [[rehypeHeadingIds, { ids }]] });
    assert.ok(html.includes('<h2 id="contact">연락처</h2>'));
    assert.ok(html.includes('<h2 id="talks">강의·특강</h2>'));
    assert.ok(html.includes("<h3>소제목</h3>"));
  });

  test("id를 정하지 않은 절 제목이면 멈춘다", () => {
    assert.throws(() => render("## 연락처\n\n## 새 절", { rehype: [[rehypeHeadingIds, { ids }]] }), /새 절/);
  });

  test("Object의 속성 이름과 같은 제목도 모르는 제목으로 본다", () => {
    assert.throws(() => render("## constructor", { rehype: [[rehypeHeadingIds, { ids }]] }), /constructor/);
  });
});

describe("rehypeDropStyle", () => {
  test("원문 HTML의 style 속성을 버린다", () => {
    const tree = { type: "root", children: [{ type: "element", properties: { style: "color:red", id: "a" }, children: [] }] };
    rehypeDropStyle()(tree);
    assert.deepEqual(tree.children[0].properties, { id: "a" });
  });
});
