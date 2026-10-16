import type { Layer, ProjectSlug } from "@/lib/content";

// 층에서 그 서비스가 쓴 기술 이름. 서비스 목록(클라이언트)과 첫 화면(서버)이 같은 규칙으로 기술 줄을 만든다.
export function layerTechs(layer: Layer | null, slug: ProjectSlug): string[] {
  return layer?.items.filter((item) => item.usedBy.includes(slug)).map((item) => item.name) ?? [];
}

export function techLine(names: string[]): string {
  return names.join(" · ");
}

// 모든 층 중 그 서비스의 가장 긴 기술 줄. 고정폭 글자라 글자 수가 곧 너비다.
export function longestTechLine(layers: Layer[], slug: ProjectSlug): string {
  return layers.map((layer) => techLine(layerTechs(layer, slug))).reduce((a, b) => (b.length > a.length ? b : a), "");
}
