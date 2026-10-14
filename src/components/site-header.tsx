import Link from "next/link";

// 헤더 (docs/02-ia.md 공통 요소). 모바일 메뉴는 JS 없이 <details>로 연다.
const NAV = [
  { label: "Work", href: "/work" },
  { label: "AI", href: "/ai" },
  { label: "Resume", href: "/resume" },
];

export function SiteHeader() {
  return (
    <header className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 md:px-16">
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

      <details className="relative md:hidden">
        <summary className="flex h-11 cursor-pointer list-none items-center px-1 text-sm [&::-webkit-details-marker]:hidden">
          메뉴
        </summary>
        <nav
          aria-label="주요 메뉴"
          className="absolute right-0 z-40 mt-1 flex w-40 flex-col rounded-lg border border-line bg-bg py-1 shadow-sm"
        >
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} className="flex h-11 items-center px-4 text-sm">
              {item.label}
            </Link>
          ))}
        </nav>
      </details>
    </header>
  );
}
