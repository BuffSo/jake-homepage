import Link from "next/link";
import { MobileMenu } from "./mobile-menu";

// 헤더 (docs/02-ia.md 공통 요소). 모바일은 "메뉴"로 같은 항목을 연다(mobile-menu.tsx).
const NAV = [
  { label: "Work", href: "/work" },
  { label: "AI", href: "/ai" },
  { label: "Resume", href: "/resume" },
];

export function SiteHeader() {
  return (
    <header className="mx-auto flex h-14 w-full md:h-16 max-w-7xl items-center justify-between px-4 md:px-16">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-4 focus:z-50 focus:rounded-md focus:bg-fg focus:px-3 focus:py-2 focus:text-bg"
      >
        본문으로 건너뛰기
      </a>
      <Link href="/" className="text-base font-bold">
        소재희
      </Link>

      <nav aria-label="주요 메뉴" className="hidden gap-7 text-[0.9375rem] md:flex">
        {NAV.map((item) => (
          <Link key={item.href} href={item.href} className="hover:underline">
            {item.label}
          </Link>
        ))}
      </nav>

      <MobileMenu items={NAV} />
    </header>
  );
}
