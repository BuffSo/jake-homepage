import type { Layer, ProjectSlug } from "@/lib/content";

// 층에서 그 서비스가 쓴 기술 이름. 서비스 목록(클라이언트)과 첫 화면(서버)이 같은 규칙으로 기술 줄을 만든다.
export function layerTechs(layer: Layer | null, slug: ProjectSlug): string[] {
  return layer?.items.filter((item) => item.usedBy.includes(slug)).map((item) => item.name) ?? [];
}

export function techLine(names: string[]): string {
  return names.join(" · ");
}

// 그 서비스가 층마다 쓴 기술 줄(겹치지 않게). 줄바꿈은 낱말 경계에서 일어나 글자 수로 높이를 알 수 없으므로,
// 서비스 목록은 이 줄들을 모두 보이지 않게 겹쳐 두고 가장 높은 줄에 칸 높이를 맞춘다.
export function techLines(layers: Layer[], slug: ProjectSlug): string[] {
  return [...new Set(layers.map((layer) => techLine(layerTechs(layer, slug))).filter(Boolean))];
}
