import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import avatar from "@/assets/jake-avatar.png";
import { MobileMenu } from "./mobile-menu";
import { CurrentNavLinks, NavLinks } from "./nav-links";

// 헤더 (docs/02-ia.md 공통 요소). 모바일은 "메뉴"로 같은 항목을 연다(mobile-menu.tsx).
// 홈 링크는 실명 대신 프로필 그림과 별칭 "Jake"다. 이름은 제목, 푸터, About, 이력서에 둔다.
// 그림은 GitHub 프로필의 일러스트에서 얼굴을 잘라 저장소에 둔 것이다(방문마다 GitHub에서 불러오지 않는다).
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
      {/* 그림은 장식이라 대체 텍스트를 비우고, 링크 이름은 보이는 글자 "Jake"다. 누르는 높이는 2.75rem이다. */}
      <Link href="/" className="inline-flex min-h-11 items-center gap-2.5 text-[0.9375rem] font-semibold tracking-[-0.01em] hover:text-accent lg:text-base">
        <Image src={avatar} alt="" width={28} height={28} className="size-7 rounded-full" />
        Jake
      </Link>

      <nav aria-label="주요 메뉴" className="hidden gap-7 text-[0.9375rem] md:flex">
        <Suspense fallback={<NavLinks items={NAV} variant="bar" />}>
          <CurrentNavLinks items={NAV} variant="bar" />
        </Suspense>
      </nav>

      <MobileMenu items={NAV} />
    </header>
  );
}
