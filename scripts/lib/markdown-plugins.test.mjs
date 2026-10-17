import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { rehypeDropStyle, rehypeHeadingIds, rehypeReviews, rehypeStackTables, remarkSoftBreaks } from "../../src/lib/markdown-plugins.mjs";

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

describe("rehypeReviews", () => {
  const label = "Peer Review";
  const quotes = [{ id: "peer-review-docthru", text: "겸손히 소통" }];
  const reviews = (options) => ({ remark: [remarkSoftBreaks], rehype: [[rehypeReviews, { label, ...options }]] });

  test("머리글 바로 뒤의 인용을 상자로 묶고, 정해 둔 글이 든 상자에만 id를 붙인다", () => {
    const md = '> 프로젝트 소개\n\n**Peer Review**\n\n> "다른 평가"\n\n---\n\n**Peer Review**\n\n> "앞 문장"\n> "늘 겸손히 소통하시는 모습"';
    const html = render(md, reviews({ quotes }));
    assert.equal((html.match(/<div class="md-review"/g) ?? []).length, 2);
    assert.ok(html.includes('<div class="md-review" id="peer-review-docthru"><p><strong>Peer Review</strong></p><blockquote>'));
    // 머리글이 없는 인용(프로젝트 소개)은 묶지 않는다
    assert.ok(html.startsWith("<blockquote>\n<p>프로젝트 소개</p>\n</blockquote>"));
  });

  test("머리글 뒤에 인용이 없으면 묶지 않는다", () => {
    const html = render("**Peer Review**\n\n- 목록", reviews());
    assert.ok(!html.includes("md-review"));
  });

  test("정해 둔 글이 든 상자가 없으면 멈춘다", () => {
    const md = "**Peer Review**\n\n> 다른 평가\n\n> 늘 겸손히 소통 (머리글 없는 인용)";
    assert.throws(() => render(md, reviews({ quotes })), /찾지 못한 글입니다: 겸손히 소통/);
  });

  test("한 글이 여러 상자에 들어 있으면 id가 겹치므로 멈춘다", () => {
    const md = "**Peer Review**\n\n> 늘 겸손히 소통\n\n**Peer Review**\n\n> 역시 겸손히 소통";
    assert.throws(() => render(md, reviews({ quotes })), /둘 이상입니다: 겸손히 소통/);
  });

  test("한 상자에 글이 둘 이상 걸리면 멈춘다", () => {
    const both = [...quotes, { id: "lead", text: "리드를 잘" }];
    const md = "**Peer Review**\n\n> 리드를 잘 하셨습니다\n> 늘 겸손히 소통";
    assert.throws(() => render(md, reviews({ quotes: both })), /둘 이상 걸렸습니다/);
  });
});

describe("rehypeDropStyle", () => {
  test("원문 HTML의 style 속성을 버린다", () => {
    const tree = { type: "root", children: [{ type: "element", properties: { style: "color:red", id: "a" }, children: [] }] };
    rehypeDropStyle()(tree);
    assert.deepEqual(tree.children[0].properties, { id: "a" });
  });
});

describe("rehypeStackTables", () => {
  const table = (heads, rows) => [`| ${heads.join(" | ")} |`, `| ${heads.map(() => "---").join(" | ")} |`, ...rows.map((r) => `| ${r.join(" | ")} |`)].join("\n");
  const stacked = (md) => render(md, { rehype: [rehypeStackTables] });

  test("본문 행이 하나뿐인 표(연락처)는 상자 대상이 되고, 칸마다 열 머리글 이름표가 붙는다", () => {
    const html = stacked(table(["이메일", "GitHub", "홈페이지"], [["a@b.c", "gh", "home"]]));
    assert.match(html, /<table class="md-stack" role="table">/);
    assert.match(html, /<td role="cell"><span class="md-label" aria-hidden="true">이메일<\/span>/);
    assert.match(html, /<span class="md-label" aria-hidden="true">홈페이지<\/span>home<\/td>/);
    assert.match(html, /<th role="columnheader">GitHub<\/th>/);
    assert.equal((html.match(/role="row"/g) ?? []).length, 2);
    assert.equal((html.match(/role="rowgroup"/g) ?? []).length, 2);
  });

  test("네 칸 이상인 표(학력)는 행이 여럿이어도 상자 대상이다", () => {
    const html = stacked(table(["기간", "학교", "전공", "졸업논문"], [["1", "2", "3", "4"], ["5", "6", "7", "8"]]));
    assert.match(html, /class="md-stack"/);
    assert.equal((html.match(/class="md-label"/g) ?? []).length, 8);
  });

  test("여러 행에 세 칸 이하인 표(수상)는 그대로 둔다", () => {
    const md = table(["연도", "수상명", "수여기관"], [["2011", "상", "기관"], ["2012", "상", "기관"]]);
    assert.equal(stacked(md), render(md));
  });
});
