import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site-meta";

// 검색엔진과 AI 크롤러(학습용 포함)를 모두 허용한다 (docs/guide/SEO_검색과_공유_정책_20261017.md).
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
