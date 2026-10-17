"use client";

import { Suspense, useEffect, useRef } from "react";
import { CurrentNavLinks, NavLinks } from "./nav-links";

type Item = { label: string; href: string; note?: string };

// 모바일 메뉴 (docs/02-ia.md 공통 요소). <details>라 JS 없이도 열린다.
// 버튼은 아이콘(☰, 열리면 X)이고 이름 "메뉴"는 화면 읽기용 글자로 둔다. 열림 상태는 <details>가 알린다.
// 패널은 헤더(relative) 바로 아래에 화면 폭 전체로 펼치고, 그 아래 페이지는 어둡게 덮는다.
// 헤더는 루트 레이아웃에 있어 페이지를 옮겨도 그대로 남으므로, 열린 메뉴가 새 페이지를 가리지 않게 닫아 준다.
// 메뉴 링크, 메뉴 밖(로고 포함)이나 어둡게 덮은 곳을 누르거나 Esc, 뒤로 가기를 하면 닫는다.
// 지금 경로는 nav-links.tsx에서만 읽고 Suspense로 감싼다. 미리 알 수 없는 경로(404)에서 루트 레이아웃 전체가 Suspense를 요구하지 않게 하기 위해서다.
export function MobileMenu({ items }: { items: Item[] }) {
  const ref = useRef<HTMLDetailsElement>(null);
  const close = () => {
    if (ref.current) ref.current.open = false;
  };

  useEffect(() => {
    const details = ref.current;
    if (!details) return;
    const close = () => {
      details.open = false;
    };
    const onPointerDown = (e: PointerEvent) => {
      if (details.open && !details.contains(e.target as Node)) close();
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Escape" || !details.open) return;
      close();
      details.querySelector("summary")?.focus();
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    window.addEventListener("popstate", close);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("popstate", close);
    };
  }, []);

  return (
    <details ref={ref} className="group md:hidden">
      {/* 아이콘 오른쪽 끝을 본문 여백 선에 맞춘다(justify-end). 누르는 크기는 2.75rem이다. */}
      <summary className="flex size-11 cursor-pointer list-none items-center justify-end [&::-webkit-details-marker]:hidden">
        <span className="sr-only">메뉴</span>
        <svg aria-hidden="true" viewBox="0 0 20 20" className="size-5 group-open:hidden" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
          <path d="M3.5 6h13M3.5 10h13M3.5 14h13" />
        </svg>
        <svg aria-hidden="true" viewBox="0 0 20 20" className="hidden size-5 group-open:block" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
          <path d="M5 5l10 10M15 5L5 15" />
        </svg>
      </summary>
      <nav aria-label="주요 메뉴" className="absolute inset-x-0 top-full z-40 flex flex-col border-y border-line bg-bg shadow-sm">
        <Suspense fallback={<NavLinks items={items} variant="menu" onNavigate={close} />}>
          <CurrentNavLinks items={items} variant="menu" onNavigate={close} />
        </Suspense>
      </nav>
      {/* 어둡게 덮는 층은 <details> 안에 있어 위의 "메뉴 밖 누름"으로 잡히지 않으므로 직접 닫는다. */}
      <div aria-hidden="true" onClick={close} className="absolute inset-x-0 top-full z-30 h-screen bg-scrim" />
    </details>
  );
}
