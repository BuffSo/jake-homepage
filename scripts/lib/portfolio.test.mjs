import assert from "node:assert/strict";
import { describe, test } from "node:test";
import {
  applyRules,
  composeChapters,
  findSection,
  howToView,
  parseDetail,
  PortfolioError,
  shiftHeadings,
} from "../../src/lib/portfolio.mjs";

// 포트폴리오 원문으로 /work 챕터를 만드는 함수 (src/lib/portfolio.mjs). 실제 원문과의 대조는 content.test.mjs에 있다.

const MD = [
  "# 포트폴리오",
  "",
  "## 1. 한눈에 보기",
  "",
  "### 보시는 방법",
  "",
  "| 서비스 | 안내 |",
  "|---|---|",
  "| **Alpha** | https://alpha.example.com<br>회원가입하시면 **바로** 보실 수 있습니다 |",
  "| **Beta** | 주소 없이 시작하는 줄 |",
  "",
  "## 2. AI 활용 - 개발",
  "",
  "앞의 절을 가리키는 문장입니다.",
  "",
  "### 자동화",
  "",
  "본문",
  "",
  "### 개발 외의 일 - 영상",
  "",
  "다른 페이지로 갈 내용",
  "",
  "---",
  "",
  "## 4. 프로젝트 상세",
  "",
  "### 4-1. Alpha - 첫 서비스",
  "",
  "**2026.01 ~ 현재** | 개인 프로젝트 (풀스택) | 🔗 https://alpha.example.com",
  "",
  "`Next.js` `PostgreSQL`",
  "",
  "> 한 줄 소개",
  "",
  "**구성** - 2절 참조",
  "",
  "#### 성능",
  "",
  "```",
  "# 코드 블록 안의 줄",
  "```",
  "",
  "<img src=\"assets/a.png\" alt=\"\">",
  "",
  "---",
  "",
  "### 4-2. Beta - 둘째 서비스",
  "",
  "**2025.01 ~ 2025.02** | 프리랜서 프로젝트 (풀스택) | 🔗 https://beta.example.com",
  "",
  "`NestJS`",
  "",
  "> 둘째 소개",
  "",
].join("\n");

describe("findSection", () => {
  test("같거나 높은 단계의 다음 제목에서 멈추고, 끝의 구분선은 뗀다", () => {
    const section = findSection(MD, "4-1. Alpha");
    assert.equal(section.level, 3);
    assert.equal(section.title, "4-1. Alpha - 첫 서비스");
    assert.ok(section.body.includes("#### 성능"));
    assert.ok(!section.body.includes("4-2. Beta"));
    assert.ok(!section.body.trimEnd().endsWith("---"));
  });

  test("until을 주면 그 제목 전까지만 쓴다", () => {
    const section = findSection(MD, "2. AI 활용 - 개발", "개발 외의 일");
    assert.ok(section.body.includes("### 자동화"));
    assert.ok(!section.body.includes("다른 페이지로 갈 내용"));
  });

  test("제목을 못 찾거나 두 번 이상 찾으면 멈춘다", () => {
    assert.throws(() => findSection(MD, "없는 제목"), PortfolioError);
    assert.throws(() => findSection(MD, "4-"), PortfolioError);
  });
});

describe("parseDetail", () => {
  test("제목, 기간·역할·주소, 스택, 인용 한 줄을 읽고 나머지를 본문으로 둔다", () => {
    const detail = parseDetail(findSection(MD, "4-1. Alpha"));
    assert.equal(detail.name, "Alpha");
    assert.equal(detail.subtitle, "첫 서비스");
    assert.equal(detail.period, "2026.01 ~ 현재");
    assert.equal(detail.role, "개인 프로젝트 (풀스택)");
    assert.equal(detail.url, "https://alpha.example.com");
    assert.deepEqual(detail.stack, ["Next.js", "PostgreSQL"]);
    assert.equal(detail.lead, "한 줄 소개");
    assert.ok(detail.body.startsWith("**구성**"));
  });

  test("머리 형식이 다르면 멈춘다", () => {
    const broken = { title: "4-9. Gamma - 셋째", body: "`Next.js`\n\n> 소개" };
    assert.throws(() => parseDetail(broken), PortfolioError);
    assert.throws(() => parseDetail({ title: "4-9. Gamma", body: "" }), PortfolioError);
  });
});

describe("howToView", () => {
  test("보시는 방법 줄에서 주소 조각을 빼고 안내만 남긴다", () => {
    assert.equal(howToView(MD, "Alpha"), "회원가입하시면 **바로** 보실 수 있습니다");
  });

  test("줄이 없거나 주소로 시작하지 않으면 멈춘다", () => {
    assert.throws(() => howToView(MD, "Gamma"), PortfolioError);
    assert.throws(() => howToView(MD, "Beta"), PortfolioError);
  });
});

describe("applyRules", () => {
  test("규칙은 여러 글을 통틀어 한 번 맞은 곳에만 적용한다", () => {
    const [a, b] = applyRules(["첫 줄\n\n지울 줄\n\n끝", "2절 참조"], {
      drop: ["지울 줄"],
      replace: [{ find: "2절 참조", to: "아래 참조" }],
    });
    assert.equal(a, "첫 줄\n\n끝");
    assert.equal(b, "아래 참조");
  });

  test("맞는 곳이 없거나 두 번 이상이면 멈춘다", () => {
    assert.throws(() => applyRules(["본문"], { drop: ["없는 줄"] }), PortfolioError);
    assert.throws(() => applyRules(["같은 줄", "같은 줄"], { drop: ["같은 줄"] }), PortfolioError);
    assert.throws(() => applyRules(["참조 참조"], { replace: [{ find: "참조", to: "x" }] }), PortfolioError);
  });

  test("replaceOnly의 글에는 replace만 적용하고 drop은 적용하지 않는다", () => {
    const rules = { drop: ["레거시"], replace: [{ find: "레거시를 새로 구축한", to: "설정으로 켜고 끄는" }] };
    const [body, lead] = applyRules(["레거시 이전 메모\n\n본문", "레거시를 새로 구축한 솔루션"], rules, { replaceOnly: [1] });
    assert.equal(body, "본문");
    assert.equal(lead, "설정으로 켜고 끄는 솔루션");
  });
});

describe("shiftHeadings", () => {
  test("코드 블록 밖의 제목만 옮긴다", () => {
    const text = "#### 성능\n\n```\n# 코드\n```";
    assert.equal(shiftHeadings(text, -1), "### 성능\n\n```\n# 코드\n```");
  });
});

describe("composeChapters", () => {
  test("본문 제목은 h3부터, AI 절 안의 제목은 h4부터 쓴다", () => {
    const [chapter] = composeChapters(MD, [
      {
        slug: "alpha",
        detail: "4-1. Alpha",
        ai: "2. AI 활용 - 개발",
        aiUntil: "개발 외의 일",
        howToView: "Alpha",
        drop: ["<img src=\"assets/a.png\"", "앞의 절을"],
        replace: [{ find: "2절 참조", to: "아래 참조" }],
      },
    ]);
    assert.equal(chapter.head.name, "Alpha");
    assert.ok(chapter.body.includes("### 성능"));
    assert.ok(chapter.body.includes("아래 참조"));
    assert.ok(!chapter.body.includes("<img"));
    assert.equal(chapter.ai.title, "AI 활용 - 개발");
    assert.ok(chapter.ai.body.startsWith("#### 자동화"));
  });
});
