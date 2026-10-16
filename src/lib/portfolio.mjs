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

const META = /^\*\*(.+?)\*\*\s*\|\s*(.+?)\s*\|\s*🔗\s*(https?:\/\/\S+)\s*$/;
const STACK = /^(?:`[^`]+`\s*)+$/;
const LEAD = /^>\s*(.+)$/;

/**
 * "4. 프로젝트 상세"의 절 하나. 제목, 기간·역할·주소 줄, 스택 줄, 인용 한 줄이 차례로 와야 한다.
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
  if (!m) throw new PortfolioError(`기간·역할·주소 줄을 읽지 못했습니다: ${section.title}`);
  if (!STACK.test(stack?.line ?? "")) throw new PortfolioError(`스택 줄을 읽지 못했습니다: ${section.title}`);
  const l = LEAD.exec(lead?.line ?? "");
  if (!l) throw new PortfolioError(`인용 한 줄을 읽지 못했습니다: ${section.title}`);

  return {
    name: title.slice(0, dash),
    subtitle: title.slice(dash + 3),
    period: m[1],
    role: m[2],
    url: m[3],
    stack: [...stack.line.matchAll(/`([^`]+)`/g)].map((s) => s[1]),
    lead: l[1],
    body: trimLines(lines.slice(lead.index + 1)).join("\n"),
  };
}

/** "보시는 방법" 표에서 그 서비스의 안내. 첫 조각(주소)은 버튼이 있으므로 뺀다. */
export function howToView(md, service) {
  const rows = findSection(md, "보시는 방법")
    .body.split("\n")
    .filter((line) => line.startsWith(`| **${service}** |`));
  exactlyOne(rows.length, `"보시는 방법"의 ${service} 줄`);
  const cells = rows[0].split("|").map((c) => c.trim());
  const [url, ...rest] = cells[2].split(/<br\s*\/?>/);
  if (!/^https?:\/\//.test(url.trim())) throw new PortfolioError(`"보시는 방법"의 ${service} 줄이 주소로 시작하지 않습니다`);
  return rest.join(" ").trim();
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

/**
 * content/site/work.md의 chapters로 챕터를 만든다.
 * 페이지에서 챕터 이름은 h2, AI 절 제목은 h3이므로 본문 제목은 h3부터, AI 절 안의 제목은 h4부터 쓴다.
 */
export function composeChapters(md, chapters) {
  return chapters.map((chapter) => {
    const detail = findSection(md, chapter.detail);
    const { body: detailBody, ...head } = parseDetail(detail);
    const ai = chapter.ai ? findSection(md, chapter.ai, chapter.aiUntil) : null;
    const [body, aiBody, lead] = applyRules([detailBody, ai?.body ?? "", head.lead], chapter, { replaceOnly: [2] });
    return {
      slug: chapter.slug,
      head: { ...head, lead },
      howToView: howToView(md, chapter.howToView),
      body: shiftHeadings(body, 3 - (detail.level + 1)),
      ai: ai ? { title: ai.title.replace(/^\d+\.\s+/, ""), body: shiftHeadings(aiBody, 4 - (ai.level + 1)) } : null,
    };
  });
}
