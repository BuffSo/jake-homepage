import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site-meta";

// 모든 페이지를 검색에 노출한다 (docs/guide/SEO_검색과_공유_정책_20261017.md). 페이지를 더하면 여기에도 더한다.
// 수정 시각(lastModified)은 빌드 시각밖에 알 수 없어 정확하지 않으므로 넣지 않는다.
const PATHS = ["/", "/work", "/ai", "/ai/case", "/resume"];

export default function sitemap(): MetadataRoute.Sitemap {
  return PATHS.map((path) => ({ url: `${SITE_URL}${path === "/" ? "" : path}` }));
}
