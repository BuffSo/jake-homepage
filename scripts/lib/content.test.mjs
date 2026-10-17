// 사이트 전용 글의 사실 검사 (ADR-0003, CLAUDE.md 콘텐츠)
// - sources의 문장은 동기화한 이력서나 포트폴리오에 그대로 있어야 한다.
// - 기술 층의 기술 이름은 scripts/stack.config.mjs의 표지 이름과 같고, 서비스 항목에 이름이 나오는 기술은 그 서비스에 표시한다(ADR-0010).
// - 저장소에서 세는 숫자의 자리 표시는 아는 이름만 쓴다.

import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { test } from "node:test";
import { parseFrontmatter } from "../../src/lib/frontmatter.mjs";
import { composeChapters, findSection } from "../../src/lib/portfolio.mjs";
import { countAdrs, countCiChecks } from "../../src/lib/repo-stats.mjs";
import stackConfig from "../stack.config.mjs";

const ROOT = process.cwd();
const squash = (s) => s.replace(/\s+/g, " ").trim();

function read(relative) {
  return parseFrontmatter(readFileSync(path.join(ROOT, relative), "utf8"), relative).data;
}

function readDir(relative) {
  return readdirSync(path.join(ROOT, relative))
    .filter((f) => f.endsWith(".md"))
    .map((f) => ({ file: f, data: read(path.join(relative, f)) }));
}

const resume = readFileSync(path.join(ROOT, "content/synced/resume.md"), "utf8");
const portfolio = readFileSync(path.join(ROOT, "content/synced/portfolio.md"), "utf8");
const synced = squash(`${resume}\n${portfolio}`);

const home = read("content/site/home.md");
const work = read("content/site/work.md");
const projects = readDir("content/site/projects");
const aiWorks = readDir("content/site/ai");
const sites = readDir("content/site/sites");

test("sources의 문장은 동기화한 이력서나 포트폴리오에 그대로 있다", () => {
  const owners = [
    { name: "home.md", data: home },
    { name: "work.md", data: work },
    { name: "resume-page.md", data: read("content/site/resume-page.md") },
    ...projects.map((p) => ({ name: p.file, data: p.data })),
    ...aiWorks.map((w) => ({ name: `ai/${w.file}`, data: w.data })),
  ];
  for (const { name, data } of owners) {
    for (const quote of data.sources ?? []) {
      assert.ok(synced.includes(squash(quote)), `${name}: 원문에 없는 문장 "${quote}"`);
    }
  }
});

test("홈 About의 동료 평가 링크는 이력서에서 같은 문장이 든 Peer Review 상자로 간다", () => {
  // 글이 원문의 상자에 있는지는 빌드가 본다(rehypeReviews). 여기서는 두 글의 짝이 맞는지만 본다.
  // 홈에서 줄인 문장은 끝에 …를 붙이고, 이력서 쪽에는 … 앞까지만 둔다.
  const { quotes } = read("content/site/resume-page.md").reviews;
  assert.equal(home.about.reviews.length, 3);
  for (const review of home.about.reviews) {
    const quote = quotes.find((q) => review.href === `/resume#${q.id}`);
    assert.ok(quote, `resume-page.md의 reviews.quotes에 없는 링크: ${review.href}`);
    assert.equal(quote.text, review.quote.replace(/ …$/, ""));
  }
});

test("기술 층은 여섯 개이고, 기술 이름은 표지 설정과 같다", () => {
  // 기술마다 서비스 코드에서 찾을 표지가 있어야 npm run check:stack이 짝을 확인한다 (ADR-0010).
  assert.equal(home.layers.length, 6);
  const names = home.layers.flatMap((layer) => layer.items.map((item) => item.name));
  assert.deepEqual([...names].sort(), Object.keys(stackConfig.techs).sort());
});

test("기술이 가리키는 서비스는 모두 있다", () => {
  const slugs = new Set(projects.map((p) => p.data.slug));
  for (const layer of home.layers) {
    for (const item of layer.items) {
      for (const slug of item.usedBy) assert.ok(slugs.has(slug), `${layer.name} · ${item.name}: 없는 서비스 ${slug}`);
    }
  }
});

// 서비스 항목: 이력서 프로젝트 절("레큐이브 (Recueve)")과 포트폴리오 상세 절("4-1. Recueve")을 합친 글
function serviceEntries() {
  return new Map(
    projects.map(({ data: project }) => {
      const heading = resume.split("\n").find((line) => line.startsWith("### ") && line.trim().endsWith(`(${project.title})`));
      assert.ok(heading, `이력서에 ${project.title} 항목이 없습니다`);
      const chapter = work.chapters.find((c) => c.slug === project.slug);
      const text = [findSection(resume, heading.slice(4).trim()).body, findSection(portfolio, chapter.detail).body].join("\n");
      return [project.slug, text];
    }),
  );
}

test("서비스 항목에 이름이 나오는 기술은 그 서비스에 표시된다", () => {
  // 반대 방향(층에 있으면 코드에 있다)은 서비스 코드가 필요해 로컬 npm run check:stack이 본다 (ADR-0010).
  const entries = serviceEntries();
  for (const layer of home.layers) {
    for (const item of layer.items) {
      for (const [slug, text] of entries) {
        if (text.includes(item.name)) assert.ok(item.usedBy.includes(slug), `${layer.name} · ${item.name}: ${slug} 항목에 이름이 있는데 표시하지 않습니다`);
      }
    }
  }
});

test("서비스 글은 카드에 필요한 값을 모두 갖고, 순서가 겹치지 않는다", () => {
  const required = ["slug", "order", "title", "summary", "headline", "period", "role", "image", "imageAlt"];
  for (const { file, data } of projects) {
    for (const key of required) assert.ok(data[key], `${file}: ${key} 없음`);
    assert.equal(`${data.slug}.md`, file);
    assert.ok(Array.isArray(data.stack) && data.stack.length > 0, `${file}: stack 없음`);
    assert.ok(data.metric?.value && data.metric?.label, `${file}: metric 없음`);
    assert.match(data.liveUrl, /^https:\/\//);
  }
  const orders = projects.map((p) => p.data.order).sort();
  assert.deepEqual(orders, [1, 2, 3]);
});

test("AI 작업 글은 항목에 필요한 값을 모두 갖고, 순서가 겹치지 않는다", () => {
  const groups = new Set(read("content/site/ai-page.md").groups.map((g) => g.id));
  const figures = new Set(["wiki-flow", "image", "hermes-flow", "site-steps", "review-flow", "mcp-flow", "workbench-flow"]);
  for (const { file, data } of aiWorks) {
    for (const key of ["slug", "order", "group", "eyebrow", "title", "problem", "built"]) {
      assert.ok(data[key], `${file}: ${key} 없음`);
    }
    assert.equal(`${data.slug}.md`, file);
    assert.ok(groups.has(data.group), `${file}: 모르는 묶음 ${data.group}`);
    assert.ok(data.metric?.value && data.metric?.label, `${file}: metric 없음`);
    assert.ok(Array.isArray(data.links), `${file}: links 없음`);
    if (data.more) {
      // 짧은 카드: 원문이 /work에 있는 항목. 그림과 결과는 /work에 있다.
      assert.match(data.more, /^\/work#[a-z-]+-ai$/, `${file}: more는 /work의 AI 절이어야 함`);
    } else {
      assert.ok(data.headline, `${file}: headline 없음`);
      assert.ok(figures.has(data.figure), `${file}: 모르는 figure ${data.figure}`);
      if (data.figure === "image") assert.ok(data.image && data.imageAlt, `${file}: 이미지 정보 없음`);
      // 개인 도구는 결과 대신 쓰는 법을 쓴다 (docs/02-ia.md /ai)
      if (data.group === "personal") assert.ok(data.usage && !data.result, `${file}: 개인 도구는 usage만 씀`);
      else assert.ok(data.result && !data.usage, `${file}: result 없음`);
    }
  }
  const orders = aiWorks.map((w) => w.data.order).sort((a, b) => a - b);
  assert.deepEqual(orders, orders.map((_, i) => i + 1));
});

test("홈 AI 카드는 네 장이고, 카드에 필요한 값을 갖는다", () => {
  const homeWorks = aiWorks.filter((w) => w.data.home !== undefined);
  assert.deepEqual(homeWorks.map((w) => w.data.home).sort(), [1, 2, 3, 4]);
  for (const { file, data } of homeWorks) {
    assert.ok(data.headline && data.desc && data.figure, `${file}: 홈 카드 값 없음`);
  }
});

test("짧은 카드가 가리키는 /work의 AI 절은 실제로 있다", () => {
  const withAi = new Set(work.chapters.filter((c) => c.ai).map((c) => `/work#${c.slug}-ai`));
  for (const { file, data } of aiWorks.filter((w) => w.data.more)) {
    assert.ok(withAi.has(data.more), `${file}: ${data.more}는 AI 절이 있는 챕터가 아님`);
  }
});

test("포트폴리오 챕터는 work.md의 구성대로 만들어지고, 서비스 글과 맞는다", () => {
  const chapters = composeChapters(portfolio, work.chapters);
  const bySlug = new Map(projects.map((p) => [p.data.slug, p.data]));
  const ordered = [...bySlug.values()].sort((a, b) => a.order - b.order).map((p) => p.slug);
  assert.deepEqual(chapters.map((c) => c.slug), ordered);
  for (const chapter of chapters) {
    const project = bySlug.get(chapter.slug);
    assert.equal(chapter.head.url, project.liveUrl, `${chapter.slug}: 원문 주소와 서비스 글의 liveUrl이 다름`);
    assert.equal(chapter.head.name, project.title, `${chapter.slug}: 원문 이름과 서비스 글의 title이 다름`);
    assert.ok(chapter.howToView, `${chapter.slug}: 보시는 방법 없음`);
  }
});

test("챕터에는 원문 이미지와 다른 절을 가리키는 문장이 남지 않는다", () => {
  for (const chapter of composeChapters(portfolio, work.chapters)) {
    const text = `${chapter.body}\n${chapter.ai?.body ?? ""}`;
    assert.doesNotMatch(text, /<img|<sub>/, `${chapter.slug}: 원문 이미지나 그 설명 줄이 남음`);
    assert.doesNotMatch(text, /\d절 참조|앞의 하네스/, `${chapter.slug}: 다른 절을 가리키는 문장이 남음`);
  }
});

test("ProWith 상세의 첫 줄은 홈 서비스 목록의 소개와 같다", () => {
  // 원문 첫 줄(레거시 전환)을 work.md의 replace로 바꿔, 설정과 쇼핑몰이 먼저 보이게 한다.
  const chapter = composeChapters(portfolio, work.chapters).find((c) => c.slug === "prowith");
  const project = projects.find((p) => p.data.slug === "prowith").data;
  assert.equal(chapter.head.lead, project.summary);
});

test("의뢰받아 만든 사이트 글은 카드에 필요한 값을 모두 갖고, 순서가 겹치지 않는다", () => {
  const required = ["slug", "order", "title", "domain", "summary", "role", "period", "commits", "imageAlt"];
  for (const { file, data } of sites) {
    for (const key of required) assert.ok(data[key], `${file}: ${key} 없음`);
    assert.equal(`${data.slug}.md`, file);
    assert.equal(data.role, "외부 의뢰");
    assert.ok(Array.isArray(data.stack) && data.stack.length > 0, `${file}: stack 없음`);
    assert.match(data.liveUrl, /^https:\/\//);
    assert.match(data.sourceUrl, /^https:\/\/github\.com\//);
  }
  assert.deepEqual(sites.map((s) => s.data.order).sort(), [1, 2]);
});

test("Recueve와 Recoeve의 소스 저장소 링크는 싣지 않는다", () => {
  const links = [...aiWorks.flatMap((w) => w.data.links).map((l) => l.href), ...sites.map((s) => s.data.sourceUrl)];
  for (const href of links) assert.doesNotMatch(href, /github\.com\/[^/]+\/rec[ou]e?ve/i);
});

test("저장소에서 세는 숫자는 실제 파일과 맞고, 자리 표시는 아는 이름만 쓴다", () => {
  const adrFiles = readdirSync(path.join(ROOT, "docs/adr")).filter((f) => /^\d{4}-.+\.md$/.test(f));
  assert.equal(countAdrs(ROOT), adrFiles.length);
  assert.ok(countCiChecks(ROOT) > 0);
  const known = new Set(["adrCount", "ciCheckCount"]);
  for (const { file, data } of aiWorks) {
    for (const [, key] of `${data.metric.value}`.matchAll(/\{(\w+)\}/g)) {
      assert.ok(known.has(key), `${file}: 모르는 자리 표시 {${key}}`);
    }
  }
});
