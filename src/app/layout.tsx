import type { Metadata, Viewport } from "next";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { SITE_URL, pageMetadata } from "@/lib/site-meta";
import { geist, geistMono } from "./fonts";
import "./globals.css";

// 서버가 그리는 모든 화면을 빌드 때 만든다. 요청마다 달라지는 값이 섞이면 빌드가 실패한다.
export const ensureStatic = "navigation";

// 홈의 메타데이터이자 모든 페이지의 바탕이다. 다른 페이지는 pageMetadata로 제목, 설명, 주소를 바꾼다.
// twitter는 페이지가 정하지 않으므로 모든 페이지에 이어진다.
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  ...pageMetadata({
    title: "소재희 · Idea to production.",
    description: "기획부터 디자인, 개발, 배포까지 전 과정을 다루는 풀스택 개발자 소재희의 홈페이지입니다.",
    path: "/",
  }),
  twitter: { card: "summary_large_image" },
  // 네이버 서치어드바이저 소유 확인. 네이버는 DNS로 확인하지 못해 태그를 단다. 지우면 소유 확인이 풀린다.
  // Google은 Vercel DNS의 TXT 레코드로 확인해서 여기에 없다 (docs/guide/SEO_검색과_공유_정책_20261017.md).
  verification: { other: { "naver-site-verification": "f8c2cba6fbf38fea24228495b83acfd15ea2969e" } },
};

export const viewport: Viewport = {
  colorScheme: "light dark",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0f1011" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" className={`${geist.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-bg font-sans text-fg">
        <SiteHeader />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
