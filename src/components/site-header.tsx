import Link from "next/link";
import { LayerMark } from "./layer-mark";
import { MobileMenu } from "./mobile-menu";

// 헤더 (docs/02-ia.md 공통 요소). 모바일은 "메뉴"로 같은 항목을 연다(mobile-menu.tsx).
// 홈 링크는 이름 대신 층 마크다. 이름이 버튼으로 쓰이지 않게 하고, 이름은 제목, 푸터, About, 이력서에 둔다.
const NAV = [
  { label: "Work", href: "/work" },
  { label: "AI", href: "/ai" },
  { label: "Resume", href: "/resume" },
];

export function SiteHeader() {
  return (
    <header className="mx-auto flex h-14 w-full md:h-16 max-w-7xl items-center justify-between px-4 md:px-16 print:hidden">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-4 focus:z-50 focus:rounded-md focus:bg-fg focus:px-3 focus:py-2 focus:text-bg"
      >
        본문으로 건너뛰기
      </a>
      {/* 누르는 영역은 2.75rem이고, 마크는 본문 왼쪽 선에 맞춘다. */}
      <Link
        href="/"
        aria-label="홈"
        className="-ml-2.5 inline-flex size-11 items-center justify-center text-fg transition-colors duration-150 hover:text-accent motion-reduce:transition-none"
      >
        <LayerMark className="size-6" />
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
