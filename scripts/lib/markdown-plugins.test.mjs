import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  rehypeChipLists,
  rehypeDropStyle,
  rehypeGroupTitles,
  rehypeHeadingIds,
  rehypeReviews,
  rehypeStackTables,
  remarkSoftBreaks,
} from "../../src/lib/markdown-plugins.mjs";
import { TECH_LOGOS, techLogo } from "../../src/lib/tech-logos.mjs";

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
    assert.match(html, /<span class="md-label" aria-hidden="true">홈페이지<\/span><span class="md-value">home<\/span><\/td>/);
    assert.match(html, /<th role="columnheader">GitHub<\/th>/);
    assert.equal((html.match(/role="row"/g) ?? []).length, 2);
    assert.equal((html.match(/role="rowgroup"/g) ?? []).length, 2);
  });

  test("네 칸 이상인 표(학력)는 행이 여럿이어도 상자 대상이다", () => {
    const html = stacked(table(["기간", "학교", "전공", "졸업논문"], [["1", "2", "3", "4"], ["5", "6", "7", "8"]]));
    assert.match(html, /class="md-stack"/);
    assert.equal((html.match(/class="md-label"/g) ?? []).length, 8);
  });

  test("글자와 굵은 글자, 링크가 섞인 칸도 이름표 하나와 값 하나만 둔다", () => {
    // 칸이 격자라서, 값을 감싸지 않으면 섞인 조각마다 격자 항목이 되어 이름표 칸으로 떨어진다
    const html = stacked(table(["기간", "학교", "전공", "졸업논문"], [["1", "앞 **굵게** 뒤", "[링크](https://x.y) 뒤", "4"]]));
    const cells = [...html.matchAll(/<td role="cell">(.*?)<\/td>/g)].map((m) => m[1]);
    for (const cell of cells) assert.match(cell, /^<span class="md-label" aria-hidden="true">[^<]*<\/span><span class="md-value">.*<\/span>$/);
    assert.match(cells[1], /<span class="md-value">앞 <strong>굵게<\/strong> 뒤<\/span>/);
  });

  test("여러 행에 세 칸 이하인 표(수상)는 그대로 둔다", () => {
    const md = table(["연도", "수상명", "수여기관"], [["2011", "상", "기관"], ["2012", "상", "기관"]]);
    assert.equal(stacked(md), render(md));
  });
});

describe("rehypeGroupTitles", () => {
  const grouped = (md) => render(md, { remark: [remarkSoftBreaks], rehype: [rehypeGroupTitles] });
  const titles = (html) => [...html.matchAll(/<p class="md-group"><strong>(.*?)<\/strong><\/p>/g)].map((m) => m[1]);

  test("굵은 글씨만 있는 줄 바로 뒤에 목록이 오면 묶음 제목으로 표시한다 (빈 줄이 있어도 없어도)", () => {
    const html = grouped(["**사업 기획**", "- 하나", "", "**서비스 개발**", "", "1. 둘"].join("\n"));
    assert.deepEqual(titles(html), ["사업 기획", "서비스 개발"]);
  });

  test("굵은 글씨 뒤에 글이 있거나, 다음이 인용이나 문단이면 표시하지 않는다", () => {
    const md = ["**풀스택 엔지니어** | 2021.03", "- 하나", "", "**Peer Review**", "", "> 인용", "", "**이름**", "", "문단"].join("\n");
    assert.doesNotMatch(grouped(md), /md-group/);
  });

  test("자기소개의 대괄호 이름표는 뒤에 목록이 와도 표시하지 않는다", () => {
    assert.doesNotMatch(grouped("**[핵심 역량]**\n\n- 하나"), /md-group/);
  });

  test("목록 안의 문단도 같은 기준으로 본다 (기타 경력의 회사 줄은 굵은 글씨 뒤에 글이 있다)", () => {
    const html = grouped(["- **1998.07 ~ 2003.04** 회사", "", "  - 하나", "", "- **묶음**", "", "  - 둘"].join("\n"));
    assert.deepEqual(titles(html), ["묶음"]);
  });
});

describe("rehypeChipLists", () => {
  const logos = { "Next.js": "M0 0h24v24H0z", NestJS: "M1 1h22v22H1z" };
  const chips = (md) => render(md, { remark: [remarkSoftBreaks], rehype: [[rehypeChipLists, { logos }]] });
  const items = (html) => [...html.matchAll(/<li>(.*?)<\/li>/g)].map((m) => m[1].replace(/<svg.*?<\/svg>/, ""));

  test("인라인 코드만 늘어선 문단을 칩 목록으로 바꾼다", () => {
    const html = chips("`NestJS` `Next.js` `Redis`");
    assert.match(html, /^<ul class="md-chips">/);
    assert.deepEqual(items(html), ["NestJS", "Next.js", "Redis"]);
    assert.doesNotMatch(html, /<code>/);
  });

  test("글과 섞인 코드는 문단 그대로 둔다", () => {
    const html = chips("설정은 `next.config.ts`에 둡니다");
    assert.doesNotMatch(html, /md-chips/);
    assert.match(html, /<code>next.config.ts<\/code>/);
  });

  test("아는 이름에는 로고를 넣고, 끝의 버전 숫자는 떼고 찾는다", () => {
    const html = chips("`Next.js 16` `NestJS`");
    const svgs = [...html.matchAll(/<svg class="md-chip-logo" viewBox="0 0 24 24" aria-hidden="true"><path d="([^"]+)"><\/path><\/svg>/g)].map((m) => m[1]);
    assert.deepEqual(svgs, [logos["Next.js"], logos.NestJS]);
    assert.deepEqual(items(html), ["Next.js 16", "NestJS"]);
  });

  test("모르는 이름은 로고 없이 글자만 그린다", () => {
    assert.equal(chips("`BullMQ` `SSE`").includes("<svg"), false);
  });

  test("로고 데이터는 모두 path 명령만 담는다 (따옴표나 태그가 섞이지 않는다)", () => {
    for (const [name, d] of Object.entries(TECH_LOGOS)) assert.match(d, /^[Mm][\d.\s,a-zA-Z-]+$/, name);
  });
});

describe("techLogo", () => {
  test("이름 끝의 버전 숫자는 떼고 찾는다 (이력서와 /work 칩이 같이 쓴다)", () => {
    assert.equal(techLogo("Next.js 16"), TECH_LOGOS["Next.js"]);
    assert.equal(techLogo("Tailwind CSS 4"), TECH_LOGOS["Tailwind CSS"]);
    assert.equal(techLogo("Three.js"), TECH_LOGOS["Three.js"]);
  });

  test("그림이 없는 이름은 undefined다", () => {
    for (const name of ["AWS", "AWS Lambda", "Motion", "Playwright", "SSE"]) assert.equal(techLogo(name), undefined, name);
  });
});
