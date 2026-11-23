import assert from "node:assert/strict";
import { describe, test } from "node:test";
import {
  applyRules,
  composeChapters,
  findSection,
  glance,
  parseDetail,
  PortfolioError,
  shiftHeadings,
} from "../../src/lib/portfolio.mjs";

// 포트폴리오 원문으로 /work 챕터를 만드는 함수 (src/lib/portfolio.mjs). 실제 원문과의 대조는 content.test.mjs에 있다.

const MD = [
  "# 포트폴리오",
  "",
  "<style>.fig p { text-align: center; }</style>",
  "",
  "## 1. 한눈에 보기",
  "",
  "프로젝트 두 개입니다.",
  "",
  '<table class="glance">',
  "<thead><tr><th>프로젝트</th><th>무엇인가</th><th>보시는 방법</th></tr></thead>",
  "<tbody>",
  '<tr><td><a href="https://alpha.example.com"><strong>Alpha</strong></a><br>풀스택<br>2026.01</td><td>첫 소개<br><strong>숫자</strong></td><td>가입 후 <code>로그인</code></td></tr>',
  '<tr><td><a href="https://a.example.com"><strong>Beta</strong></a><br>풀스택<br>2026.03</td><td>둘째 소개</td><td><a href="https://a.example.com">소개 영상</a>으로 보실 수 있습니다</td></tr>',
  "</tbody>",
  "</table>",
  "",
  "## 2. 프로젝트 상세",
  "",
  "### 2-1. Alpha - 첫 서비스",
  "",
  "2026.01 ~ 2026.02 | 개인 프로젝트 (풀스택) | 🔗 https://alpha.example.com",
  "",
  "`Next.js` `PostgreSQL`",
  "",
  "> 한 줄 소개",
  "",
  "- 성능 - 병목을 잡았습니다(5-1)",
  "",
  "#### 성능",
  "",
  "```",
  "# 코드 블록 안의 줄",
  "```",
  "",
  "### 2-2. Beta - 둘째 서비스",
  "",
  "2026.03 | 개인 프로젝트 | 🔗 https://a.example.com (소개 영상) · https://b.example.com (공개 저장소)",
  "",
  "`NestJS`",
  "",
  "> 둘째 소개",
  "",
  "---",
  "",
  "## 3. AI 활용 - 개발",
  "",
  "**앞의 절을 가리키는 문장입니다.**",
  "",
  "### 3-1. Alpha - 스킬",
  "",
  "본문",
  "",
  "#### 무엇을",
  "",
  "표",
  "",
  "### 3-2. Beta - 앱",
  "",
  "다른 챕터로 갈 내용",
  "",
  "---",
  "",
  "## 5. 성능",
  "",
  "### 5-1. Alpha 성능 개선 - 세 번",
  "",
  "성능 본문",
  "",
].join("\n");

/** MD의 한 줄을 바꾼 글 */
const swap = (from, to) => {
  assert.ok(MD.includes(from));
  return MD.replace(from, to);
};

describe("findSection", () => {
  test("같거나 높은 단계의 다음 제목에서 멈추고, 끝의 구분선은 뗀다", () => {
    const section = findSection(MD, "2-2. Beta");
    assert.equal(section.level, 3);
    assert.equal(section.title, "2-2. Beta - 둘째 서비스");
    assert.ok(section.body.endsWith("> 둘째 소개"));
    const alpha = findSection(MD, "2-1. Alpha");
    assert.ok(alpha.body.includes("# 코드 블록 안의 줄"));
    assert.ok(!alpha.body.includes("2-2. Beta"));
  });

  test("until을 주면 그 제목 전까지만 쓴다", () => {
    const section = findSection(MD, "3. AI 활용 - 개발", "3-2. Beta");
    assert.ok(section.body.includes("### 3-1. Alpha - 스킬"));
    assert.ok(!section.body.includes("다른 챕터로 갈 내용"));
  });

  test("제목을 못 찾거나 두 번 이상 찾으면 멈춘다", () => {
    assert.throws(() => findSection(MD, "없는 제목"), PortfolioError);
    assert.throws(() => findSection(MD, "2-"), PortfolioError);
    assert.throws(() => findSection(MD, "3. AI 활용 - 개발", "없는 제목"), PortfolioError);
  });
});

describe("parseDetail", () => {
  test("제목, 기간·역할·주소, 스택, 인용 한 줄을 읽고 나머지를 본문으로 둔다", () => {
    const detail = parseDetail(findSection(MD, "2-1. Alpha"));
    assert.equal(detail.name, "Alpha");
    assert.equal(detail.subtitle, "첫 서비스");
    assert.equal(detail.period, "2026.01 ~ 2026.02");
    assert.equal(detail.role, "개인 프로젝트 (풀스택)");
    assert.deepEqual(detail.links, [{ url: "https://alpha.example.com", label: null }]);
    assert.deepEqual(detail.stack, ["Next.js", "PostgreSQL"]);
    assert.equal(detail.lead, "한 줄 소개");
    assert.ok(detail.body.startsWith("- 성능 - 병목을"));
  });

  test("주소가 여럿이면 가운뎃점으로 나누고, 괄호의 글을 링크 이름으로 읽는다", () => {
    const detail = parseDetail(findSection(MD, "2-2. Beta"));
    assert.equal(detail.period, "2026.03");
    assert.deepEqual(detail.links, [
      { url: "https://a.example.com", label: "소개 영상" },
      { url: "https://b.example.com", label: "공개 저장소" },
    ]);
  });

  test("머리 형식이 다르면 멈춘다", () => {
    const meta = "2026.01 ~ 2026.02 | 개인 프로젝트 (풀스택) | 🔗 https://alpha.example.com";
    const broken = (to) => () => parseDetail(findSection(swap(meta, to), "2-1. Alpha"));
    assert.throws(broken("**2026.01 ~ 2026.02** | 개인 프로젝트 (풀스택) | 🔗 https://alpha.example.com"), PortfolioError);
    assert.throws(broken("2026.01 ~ 2026.02 | 개인 프로젝트 (풀스택)"), PortfolioError);
    assert.throws(broken("2026.01 | 개인 | 🔗 https://a.example.com https://b.example.com"), PortfolioError);
    assert.throws(broken("2026.01 | 개인 | 🔗 https://a.example.com · 주소 아님"), PortfolioError);
    assert.throws(() => parseDetail(findSection(swap("`Next.js` `PostgreSQL`", "Next.js"), "2-1. Alpha")), PortfolioError);
    assert.throws(() => parseDetail(findSection(swap("> 한 줄 소개", "한 줄 소개"), "2-1. Alpha")), PortfolioError);
    assert.throws(() => parseDetail({ title: "2-9. 부제 없는 제목", body: "" }), PortfolioError);
  });
});

describe("glance", () => {
  test("한눈에 보기 표에서 무엇인가의 첫 줄과 보시는 방법 칸을 읽는다", () => {
    assert.deepEqual(glance(MD, "Alpha"), { what: "첫 소개", howToView: "가입 후 <code>로그인</code>" });
    assert.equal(glance(MD, "Beta").howToView, '<a href="https://a.example.com">소개 영상</a>으로 보실 수 있습니다');
  });

  test("줄이 없거나 둘 이상이면 멈춘다", () => {
    assert.throws(() => glance(MD, "Gamma"), PortfolioError);
    assert.throws(() => glance(swap("<strong>Beta</strong>", "<strong>Alpha</strong>"), "Alpha"), PortfolioError);
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
  const ALPHA = {
    slug: "alpha",
    detail: "2-1. Alpha",
    after: { section: "3. AI 활용 - 개발", until: "3-2. Beta", id: "alpha-ai" },
    drop: ["**앞의 절을"],
    replace: [{ find: "잡았습니다(5-1)", to: "잡았습니다(아래 성능 개선)" }],
  };

  test("본문 제목은 h3부터, 붙는 절 안의 제목은 h4부터 쓰고 번호를 뗀다", () => {
    const [chapter] = composeChapters(MD, [ALPHA]);
    assert.equal(chapter.head.name, "Alpha");
    assert.equal(chapter.head.lead, "한 줄 소개");
    assert.equal(chapter.howToView, "가입 후 <code>로그인</code>");
    assert.ok(chapter.body.includes("### 성능"));
    assert.ok(chapter.body.includes("잡았습니다(아래 성능 개선)"));
    assert.deepEqual(
      { id: chapter.after.id, title: chapter.after.title },
      { id: "alpha-ai", title: "AI 활용 - 개발" },
    );
    assert.ok(chapter.after.body.startsWith("#### Alpha - 스킬"));
    assert.ok(chapter.after.body.includes("##### 무엇을"));
    assert.doesNotMatch(chapter.after.body, /3-1\.|3-2|앞의 절을/);
  });

  test("붙는 절이 하위 절이면 그 제목에서 번호만 뗀다", () => {
    const [chapter] = composeChapters(MD, [
      { slug: "alpha", detail: "2-1. Alpha", after: { section: "5-1. Alpha 성능 개선", id: "alpha-performance" }, replace: ALPHA.replace },
    ]);
    assert.equal(chapter.after.title, "Alpha 성능 개선 - 세 번");
    assert.equal(chapter.after.body, "성능 본문");
  });

  test("lead가 glance면 큰 글씨는 표의 문장이고, 원문 인용은 본문 맨 앞에 남는다", () => {
    const [chapter] = composeChapters(MD, [{ slug: "beta", detail: "2-2. Beta", lead: "glance" }]);
    assert.equal(chapter.head.lead, "둘째 소개");
    assert.ok(chapter.body.startsWith("> 둘째 소개"));
    assert.equal(chapter.after, null);
    assert.equal(chapter.head.links.length, 2);
  });
});
