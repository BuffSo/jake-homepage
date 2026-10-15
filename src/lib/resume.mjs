// 동기화한 이력서로 /resume을 만든다 (docs/02-ia.md /resume, ADR-0003).
// 원문 문장은 고치지 않는다. 머리(한 줄 소개, 이름)를 떼어 내고, 절 제목이 resume-page.md의 목차와 맞는지만 본다.
// 맞지 않으면 예외를 던져 빌드와 테스트를 멈춘다. portfolio.mjs와 같은 방식이다.
// 파일은 읽지 않는다. 사이트(src/lib/content.ts)와 테스트(scripts/lib/)가 같이 쓴다.

export class ResumeError extends Error {}

const FENCE = /^```/;
const H1 = /^#\s+(.+)$/;
const H2 = /^##\s+(.+)$/;

/**
 * 첫 구분선(---) 앞을 머리로 자른다. 머리는 한 줄 소개 한 줄과 `# 이름` 한 줄이어야 한다.
 * @returns {{ tagline: string, name: string, body: string }}
 */
export function splitResume(md) {
  const lines = md.replace(/\r\n/g, "\n").split("\n");
  const rule = lines.findIndex((line) => line.trim() === "---");
  if (rule === -1) throw new ResumeError("이력서에 머리를 나누는 구분선(---)이 없습니다.");

  const head = lines.slice(0, rule).filter((line) => line.trim() !== "");
  const names = head.filter((line) => H1.test(line));
  if (head.length !== 2 || names.length !== 1 || H1.test(head[0])) {
    throw new ResumeError("이력서 머리는 한 줄 소개 한 줄과 # 이름 한 줄이어야 합니다.");
  }

  return {
    tagline: head[0].trim(),
    name: H1.exec(names[0])[1].trim(),
    body: lines.slice(rule + 1).join("\n").trim(),
  };
}

/** 코드 블록 밖의 절(h2) 제목 */
export function sectionTitles(body) {
  const titles = [];
  let inFence = false;
  for (const line of body.split("\n")) {
    if (FENCE.test(line)) inFence = !inFence;
    else if (!inFence) {
      const m = H2.exec(line);
      if (m) titles.push(m[1].trim());
    }
  }
  return titles;
}

/** 원문의 절 제목이 목차(sections)와 순서까지 같은지 본다 */
export function checkSections(body, sections) {
  const actual = sectionTitles(body);
  const expected = sections.map((section) => section.title);
  if (actual.join("\n") !== expected.join("\n")) {
    throw new ResumeError(`이력서의 절이 목차와 다릅니다. 원문: ${actual.join(", ")} / 목차: ${expected.join(", ")}`);
  }
}
