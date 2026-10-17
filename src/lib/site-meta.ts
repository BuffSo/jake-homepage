import type { Metadata } from "next";
import ogImage from "@/assets/og-image.png";

// 검색과 공유에 쓰는 메타데이터 (docs/guide/SEO_검색과_공유_정책_20261017.md).
// 운영 주소가 기준이다. 미리보기 배포 주소나 로컬 주소로 열어도 canonical과 og:url은 이 주소를 가리킨다.
export const SITE_URL = "https://genys.kr";
export const SITE_NAME = "소재희";

// 모든 페이지가 같은 미리보기 그림 한 장을 쓴다. npm run og:image가 만든다.
// 가져온 그림의 주소에는 내용 해시가 붙어, 그림을 바꾸면 주소도 바뀌어 메신저가 새 그림을 가져간다.
const OG_IMAGE = { url: ogImage.src, width: ogImage.width, height: ogImage.height, alt: "Idea to production. 소재희 · genys.kr" };

/**
 * 페이지 하나의 제목, 설명, 대표 주소, 공유 정보.
 * Next의 메타데이터는 얕게 합쳐져서, 페이지가 openGraph를 정하면 레이아웃의 openGraph가 통째로 바뀐다.
 * 그래서 공통 필드(사이트 이름, 언어, 종류, 그림)도 여기서 매번 채운다.
 * 그림을 파일 규칙(app/opengraph-image.png)으로 두면 하위 페이지의 openGraph가 덮어 홈에만 붙었다.
 */
export function pageMetadata({ title, description, path }: { title: string; description: string; path: string }): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { type: "website", siteName: SITE_NAME, locale: "ko_KR", url: path, title, description, images: [OG_IMAGE] },
  };
}
