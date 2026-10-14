import type { Metadata, Viewport } from "next";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { geist, geistMono } from "./fonts";
import "./globals.css";

// 서버가 그리는 모든 화면을 빌드 때 만든다. 요청마다 달라지는 값이 섞이면 빌드가 실패한다.
export const ensureStatic = "navigation";

export const metadata: Metadata = {
  title: "소재희 · Idea to production.",
  description: "기획부터 디자인, 개발, 배포까지 전 과정을 다루는 풀스택 개발자 소재희의 홈페이지입니다.",
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
