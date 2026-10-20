// 동기화한 AI 도구 활용 사례로 /ai/case를 만든다 (docs/02-ia.md /ai/case, ADR-0003 원본 추가).
// 원문 문장은 고치지 않는다. json(제목, 부제, 4컷 설명과 자를 자리, 본문 제목)과 txt(본문 문단)를 읽어 맞는지만 본다.
// 맞지 않으면 예외를 던져 빌드와 테스트를 멈춘다. resume.mjs, portfolio.mjs와 같은 방식이다.
// 파일은 읽지 않는다. 사이트(src/lib/content.ts)와 테스트(scripts/lib/)가 같이 쓴다.

export class AiCaseError extends Error {}

const PANELS = 4;

// 원본 칸에는 1px 흰 여백과 둥근 모서리 바깥의 흰 부분이 있어, 그대로 자르면 다크 모드에서 흰 테두리로 보였다.
// 그래서 원본의 자를 자리보다 안쪽으로 이만큼(원본 그림의 화소) 더 자른다 (docs/03-design.md AI 사례).
export const PANEL_INSET = 8;

const nonEmpty = (value) => typeof value === "string" && value.trim() !== "";

/**
 * @returns {{ title: string, subtitle: string, heading: string, panels: { crop: [number, number, number, number], caption: string }[], body: string[] }}
 */
export function parseAiCase(jsonText, bodyText) {
  let data;
  try {
    data = JSON.parse(jsonText);
  } catch {
    throw new AiCaseError("사례 json을 읽지 못했습니다.");
  }

  for (const key of ["title", "subtitle", "heading"]) {
    if (!nonEmpty(data[key])) throw new AiCaseError(`사례 json에 ${key}가 없습니다.`);
  }
  if (data.subtitle.includes("|")) {
    throw new AiCaseError("부제에 작성자 이름이 남아 있습니다. scripts/sync.config.mjs의 부제 규칙을 확인해 주세요.");
  }
  if (!Array.isArray(data.panels) || data.panels.length !== PANELS) {
    throw new AiCaseError(`4컷 설명은 ${PANELS}개여야 합니다.`);
  }

  const panels = data.panels.map((panel, i) => {
    const crop = panel?.crop;
    const cropOk = Array.isArray(crop) && crop.length === 4 && crop.every((n) => Number.isFinite(n) && n >= 0);
    if (!cropOk || !nonEmpty(panel.caption)) throw new AiCaseError(`${i + 1}번째 칸의 자리나 설명이 올바르지 않습니다.`);
    return { crop: [...crop], caption: panel.caption.trim() };
  });

  const body = bodyText
    .replace(/\r\n/g, "\n")
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
  if (body.length === 0) throw new AiCaseError("사례 본문이 비어 있습니다.");

  return { title: data.title.trim(), subtitle: data.subtitle.trim(), heading: data.heading.trim(), panels, body };
}

/** 문단의 첫 문장. 검색 설명에 쓴다. 마침표 뒤에 공백이나 끝이 와야 문장 끝으로 본다(1.5 같은 숫자는 자르지 않는다). */
export function firstSentence(paragraph) {
  const match = /^(.+?[.!?])(?=\s|$)/s.exec(paragraph.trim());
  return match ? match[1] : paragraph.trim();
}

const percent = (n) => `${Math.round(n * 1e4) / 1e4}%`;

/**
 * 그림 한 장에서 칸 하나만 보이게 하는 상자와 그림의 위치.
 * 상자는 칸의 비율을 갖고, 그림은 상자 폭에 대한 %로 크기와 위치를 정한다.
 * @param {[number, number, number, number]} crop 원본 그림에서 칸의 자리 (x, y, 폭, 높이)
 * @param {{ width: number, height: number }} image 원본 그림 크기
 */
export function panelBox(crop, image) {
  const [x, y, w, h] = [crop[0] + PANEL_INSET, crop[1] + PANEL_INSET, crop[2] - 2 * PANEL_INSET, crop[3] - 2 * PANEL_INSET];
  if (w <= 0 || h <= 0 || x + w > image.width || y + h > image.height) {
    throw new AiCaseError("4컷의 자를 자리가 그림 밖으로 나갑니다.");
  }
  return {
    aspectRatio: `${w} / ${h}`,
    width: percent((image.width / w) * 100),
    height: percent((image.height / h) * 100),
    left: percent((-x / w) * 100),
    top: percent((-y / h) * 100),
  };
}
