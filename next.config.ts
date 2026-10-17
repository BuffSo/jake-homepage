import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  // 미리보기와 검색 봇(카카오톡, 슬랙, X, 빙, 네이버 등 htmlLimitedBots)에게는 미리 만든 페이지 대신 요청마다 서버에서 새로 그린다.
  // 그때 src/lib/repo-stats.mjs가 ci.yml을 읽는데, 빌드의 파일 추적이 이 파일을 서버 출력에 넣지 않아 홈과 /ai가 500을 냈다.
  outputFileTracingIncludes: {
    "/**": [".github/workflows/ci.yml"],
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
