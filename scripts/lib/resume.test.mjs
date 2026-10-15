import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, test } from "node:test";
import { parseFrontmatter } from "../../src/lib/frontmatter.mjs";
import { checkSections, ResumeError, sectionTitles, splitResume } from "../../src/lib/resume.mjs";

// 동기화한 이력서로 /resume을 만드는 함수 (src/lib/resume.mjs)

const MD = [
  "한 줄 소개입니다",
  "",
  "# 이름",
  "",
  "---",
  "",
  "## 연락처",
  "",
  "| 이메일 |",
  "| --- |",
  "| a@example.com |",
  "",
  "---",
  "",
  "## 경력",
  "",
  "```md",
  "## 코드 안의 제목",
  "```",
  "",
].join("\n");

const SECTIONS = [
  { id: "contact", title: "연락처" },
  { id: "experience", title: "경력" },
];

describe("splitResume", () => {
  test("첫 구분선 앞을 한 줄 소개와 이름으로 나누고 나머지를 본문으로 돌려준다", () => {
    const { tagline, name, body } = splitResume(MD);
    assert.equal(tagline, "한 줄 소개입니다");
    assert.equal(name, "이름");
    assert.ok(body.startsWith("## 연락처"));
    assert.ok(body.endsWith("```"));
  });

  test("Windows 줄바꿈도 같게 읽는다", () => {
    assert.equal(splitResume(MD.replace(/\n/g, "\r\n")).name, "이름");
  });

  test("구분선이 없으면 멈춘다", () => {
    assert.throws(() => splitResume("한 줄\n\n# 이름\n\n## 연락처"), ResumeError);
  });

  test("머리에 이름(h1)이 없으면 멈춘다", () => {
    assert.throws(() => splitResume("한 줄\n\n이름\n\n---\n\n## 연락처"), ResumeError);
  });

  test("머리의 줄 수나 순서가 다르면 멈춘다", () => {
    assert.throws(() => splitResume("# 이름\n\n한 줄\n\n---\n"), ResumeError);
    assert.throws(() => splitResume("첫 줄\n둘째 줄\n\n# 이름\n\n---\n"), ResumeError);
    assert.throws(() => splitResume("한 줄\n\n# 이름\n# 또 이름\n\n---\n"), ResumeError);
  });
});

describe("checkSections", () => {
  const { body } = splitResume(MD);

  test("코드 블록 안의 ## 줄은 절로 세지 않는다", () => {
    assert.deepEqual(sectionTitles(body), ["연락처", "경력"]);
  });

  test("절 제목과 순서가 목차와 같으면 통과한다", () => {
    assert.doesNotThrow(() => checkSections(body, SECTIONS));
  });

  test("절이 빠지거나 더 있으면 멈춘다", () => {
    assert.throws(() => checkSections(body, SECTIONS.slice(0, 1)), ResumeError);
    assert.throws(() => checkSections(body, [...SECTIONS, { id: "awards", title: "수상" }]), ResumeError);
  });

  test("순서가 다르면 멈춘다", () => {
    assert.throws(() => checkSections(body, [...SECTIONS].reverse()), ResumeError);
  });
});

describe("실제 이력서", () => {
  const ROOT = process.cwd();
  const md = readFileSync(path.join(ROOT, "content/synced/resume.md"), "utf8");
  const page = parseFrontmatter(readFileSync(path.join(ROOT, "content/site/resume-page.md"), "utf8")).data;

  test("동기화한 이력서의 머리와 절이 resume-page.md와 맞는다", () => {
    const { tagline, name, body } = splitResume(md);
    assert.ok(tagline.length > 0);
    assert.equal(name, "소재희");
    assert.doesNotThrow(() => checkSections(body, page.sections));
  });

  test("목차의 id는 겹치지 않고 영어 소문자다", () => {
    const ids = page.sections.map((s) => s.id);
    assert.equal(new Set(ids).size, ids.length);
    for (const id of ids) assert.match(id, /^[a-z]+(-[a-z]+)*$/);
  });
});
