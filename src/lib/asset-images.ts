import type { StaticImageData } from "next/image";

// 글에 적은 경로(src/assets/…)로 그림을 찾는다. /ai 영상 목록과 홈 영상 카드가 함께 쓴다.
// 영상을 더할 때 코드를 고치지 않게, 썸네일은 글(content/site/ai/video.md)에 적은 경로로 찾는다.
// src/assets 아래 그림을 빌드할 때 한꺼번에 불러 두는 것은 Turbopack의 import.meta.glob이다.
// { import: "default" } 옵션은 개발 서버에서는 되지만 next build에서는 값이 모두 undefined였다(Next.js 16.4.2).
// 그래서 모듈째 불러 default를 직접 꺼낸다 (docs/guide/CONTENT_AI_사례_20261020.md).
const MODULES = import.meta.glob<{ default: StaticImageData }>(["/src/assets/**/*.jpg", "/src/assets/**/*.png"], {
  eager: true,
});

/** 글의 경로(src/assets/…)로 그림을 찾는다. 없으면 빌드가 멈춘다. */
export function assetImage(file: string): StaticImageData {
  const image = MODULES[`/${file}`]?.default;
  if (!image) throw new Error(`그림이 없습니다: ${file}`);
  return image;
}
