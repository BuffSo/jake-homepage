// 포트폴리오 원문으로 /work의 서비스 챕터를 만든다 (docs/02-ia.md /work, ADR-0003).
// 원문 문장은 다시 쓰지 않는다. 절을 잘라 잇고, 챕터 순서 때문에 맞지 않는 곳만 content/site/work.md의 규칙으로 고친다.
// 찾을 대상이 없거나 두 번 이상 맞으면 예외를 던져 빌드와 테스트를 멈춘다. 동기화 규칙과 같은 방식이다.
// 파일은 읽지 않는다. 사이트(src/lib/content.ts)와 테스트(scripts/lib/)가 같이 쓴다.

export class PortfolioError extends Error {}

const HEADING = /^(#{1,6})\s+(.*)$/;
const FENCE = /^```/;

/** 코드 블록 밖의 제목 줄 */
function headings(lines) {
  const found = [];
  let inFence = false;
  lines.forEach((line, index) => {
    if (FENCE.test(line)) inFence = !inFence;
    else if (!inFence) {
      const m = HEADING.exec(line);
      if (m) found.push({ index, level: m[1].length, text: m[2].trim() });
    }
  });
  return found;
}

function exactlyOne(count, what) {
  if (count !== 1) throw new PortfolioError(`${what}을(를) ${count}번 찾았습니다. 한 번이어야 합니다.`);
}

/** 앞뒤의 빈 줄과 끝의 구분선(---)을 뗀다 */
function trimLines(lines) {
  const out = [...lines];
  while (out.length && out[0].trim() === "") out.shift();
  while (out.length && ["", "---"].includes(out.at(-1).trim())) out.pop();
  return out;
}

/**
 * 제목이 heading으로 시작하는 절의 본문. 같거나 높은 단계의 다음 제목 전까지다.
 * until을 주면 절 안에서 제목이 until로 시작하는 곳 전까지만 쓴다.
 * @returns {{ level: number, title: string, body: string }}
 */
export function findSection(md, heading, until) {
  const lines = md.split("\n");
  const all = headings(lines);
  const hits = all.filter((h) => h.text.startsWith(heading));
  exactlyOne(hits.length, `제목 "${heading}"`);
  const start = hits[0];
  let end = all.find((h) => h.index > start.index && h.level <= start.level)?.index ?? lines.length;
  if (until) {
    const stops = all.filter((h) => h.index > start.index && h.index < end && h.text.startsWith(until));
    exactlyOne(stops.length, `"${heading}" 안의 제목 "${until}"`);
    end = stops[0].index;
  }
  return { level: start.level, title: start.text, body: trimLines(lines.slice(start.index + 1, end)).join("\n") };
}

const META = /^(.+?)\s*\|\s*(.+?)\s*\|\s*🔗\s*(https?:\/\/.+)$/;
const LINK = /^(https?:\/\/\S+)(?:\s+\((.+)\))?$/;
const STACK = /^(?:`[^`]+`\s*)+$/;
const LEAD = /^>\s*(.+)$/;

/**
 * "2. 프로젝트 상세"의 절 하나. 제목, 기간·역할·주소 줄, 스택 줄, 인용 한 줄이 차례로 와야 한다.
 * 주소는 가운뎃점으로 여럿을 이을 수 있고, 주소 뒤 괄호의 글은 그 링크의 이름이다.
 * @param {{ title: string, body: string }} section
 */
export function parseDetail(section) {
  const title = section.title.replace(/^[\d-]+\.\s+/, "");
  const dash = title.indexOf(" - ");
  if (dash < 0) throw new PortfolioError(`제목에 "이름 - 부제" 형식이 없습니다: ${section.title}`);

  const lines = section.body.split("\n");
  const filled = lines.map((line, index) => ({ line: line.trim(), index })).filter((l) => l.line !== "");
  const [meta, stack, lead] = filled;
  const m = META.exec(meta?.line ?? "");
  if (!m || m[1].includes("*")) throw new PortfolioError(`기간·역할·주소 줄을 읽지 못했습니다: ${section.title}`);
  const links = m[3].split(/\s+·\s+/).map((part) => {
    const link = LINK.exec(part.trim());
    if (!link) throw new PortfolioError(`주소를 읽지 못했습니다: ${section.title}`);
    return { url: link[1], label: link[2] ?? null };
  });
  if (!STACK.test(stack?.line ?? "")) throw new PortfolioError(`스택 줄을 읽지 못했습니다: ${section.title}`);
  const l = LEAD.exec(lead?.line ?? "");
  if (!l) throw new PortfolioError(`인용 한 줄을 읽지 못했습니다: ${section.title}`);

  return {
    name: title.slice(0, dash),
    subtitle: title.slice(dash + 3),
    period: m[1],
    role: m[2],
    links,
    stack: [...stack.line.matchAll(/`([^`]+)`/g)].map((s) => s[1]),
    lead: l[1],
    body: trimLines(lines.slice(lead.index + 1)).join("\n"),
  };
}

const GLANCE_ROW = /^<tr><td><a href="[^"]+"><strong>(.+?)<\/strong><\/a>.*?<\/td><td>(.*?)<\/td><td>(.*)<\/td><\/tr>$/;

/**
 * "1. 한눈에 보기" 표에서 그 프로젝트의 줄. 표는 HTML이고 한 줄이 한 프로젝트다(프로젝트 · 무엇인가 · 보시는 방법).
 * @returns {{ what: string, howToView: string }} what은 "무엇인가" 칸의 첫 줄, howToView는 셋째 칸(HTML 그대로)
 */
export function glance(md, project) {
  const rows = findSection(md, "1. 한눈에 보기")
    .body.split("\n")
    .map((line) => GLANCE_ROW.exec(line.trim()))
    .filter((m) => m && m[1] === project);
  exactlyOne(rows.length, `"한눈에 보기"의 ${project} 줄`);
  const [, , what, how] = rows[0];
  return { what: what.split(/<br\s*\/?>/)[0].trim(), howToView: how.trim() };
}

/**
 * 챕터 규칙. drop은 그 접두어로 시작하는 줄을 지우고, replace는 문자열을 바꾼다.
 * 규칙마다 여러 글(프로젝트 본문, AI 절, 인용 한 줄)을 통틀어 정확히 한 번 맞아야 한다.
 * replaceOnly에 든 번호의 글에는 replace만 적용한다. 인용 한 줄처럼 지워지면 안 되는 글이다.
 * @param {string[]} texts
 * @param {{ drop?: string[], replace?: { find: string, to: string }[] }} rules
 * @param {{ replaceOnly?: number[] }} [options]
 */
export function applyRules(texts, { drop = [], replace = [] } = {}, { replaceOnly = [] } = {}) {
  let out = texts.map((t) => t.split("\n"));
  const droppable = (i) => !replaceOnly.includes(i);
  for (const prefix of drop) {
    const hits = out.filter((_, i) => droppable(i)).flat().filter((line) => line.startsWith(prefix));
    exactlyOne(hits.length, `"${prefix}"로 시작하는 줄`);
    out = out.map((lines, i) => (droppable(i) ? lines.filter((line) => !line.startsWith(prefix)) : lines));
  }
  // 줄을 뺀 자리에 빈 줄이 겹치거나 앞뒤에 남지 않게 한다.
  let joined = out.map((lines) => trimLines(lines).join("\n").replace(/\n{3,}/g, "\n\n"));
  for (const { find, to } of replace) {
    exactlyOne(joined.reduce((n, t) => n + t.split(find).length - 1, 0), `"${find}"`);
    joined = joined.map((t) => t.replace(find, to));
  }
  return joined;
}

/** 코드 블록 밖의 제목 단계를 delta만큼 옮긴다 */
export function shiftHeadings(text, delta) {
  if (delta === 0) return text;
  const lines = text.split("\n");
  for (const h of headings(lines)) {
    const level = Math.min(6, Math.max(1, h.level + delta));
    lines[h.index] = `${"#".repeat(level)} ${h.text}`;
  }
  return lines.join("\n");
}

/** 절 제목 앞의 번호("3. ", "5-1. ")를 뗀다 */
const unnumber = (title) => title.replace(/^[\d-]+\.\s+/, "");

/** 코드 블록 밖의 제목에서 번호를 뗀다 */
function unnumberHeadings(text) {
  const lines = text.split("\n");
  for (const h of headings(lines)) lines[h.index] = `${"#".repeat(h.level)} ${unnumber(h.text)}`;
  return lines.join("\n");
}

/**
 * content/site/work.md의 chapters로 챕터를 만든다.
 * 페이지에서 챕터 이름은 h2, 이어 붙인 절 제목은 h3이므로 본문 제목은 h3부터, 이어 붙인 절 안의 제목은 h4부터 쓴다.
 * lead가 "glance"면 큰 글씨 첫 줄을 "한눈에 보기" 표의 "무엇인가"에서 가져오고, 원문 인용은 본문 맨 앞에 그대로 둔다.
 */
export function composeChapters(md, chapters) {
  return chapters.map((chapter) => {
    const detail = findSection(md, chapter.detail);
    const { body: detailBody, ...head } = parseDetail(detail);
    const row = glance(md, head.name);
    const after = chapter.after ? findSection(md, chapter.after.section, chapter.after.until) : null;
    const fromGlance = chapter.lead === "glance";
    const fullBody = fromGlance ? `> ${head.lead}\n\n${detailBody}` : detailBody;
    const [body, afterBody, lead] = applyRules([fullBody, after?.body ?? "", fromGlance ? row.what : head.lead], chapter, { replaceOnly: [2] });
    return {
      slug: chapter.slug,
      head: { ...head, lead },
      howToView: row.howToView,
      body: shiftHeadings(body, 3 - (detail.level + 1)),
      after: after
        ? { id: chapter.after.id, title: unnumber(after.title), body: unnumberHeadings(shiftHeadings(afterBody, 4 - (after.level + 1))) }
        : null,
    };
  });
}
