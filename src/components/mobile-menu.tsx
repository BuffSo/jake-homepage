"use client";

import { Suspense, useEffect, useRef } from "react";
import { CurrentNavLinks, NavLinks } from "./nav-links";

type Item = { label: string; href: string };

// 모바일 메뉴. <details>라 JS 없이도 열린다.
// 헤더는 루트 레이아웃에 있어 페이지를 옮겨도 그대로 남으므로, 열린 메뉴가 새 페이지를 가리지 않게 닫아 준다.
// 메뉴 링크, 메뉴 밖(로고 포함)을 누르거나 Esc, 뒤로 가기를 하면 닫는다.
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
    <details ref={ref} className="relative md:hidden">
      <summary className="flex h-11 cursor-pointer list-none items-center px-1 text-sm [&::-webkit-details-marker]:hidden">
        메뉴
      </summary>
      <nav
        aria-label="주요 메뉴"
        className="absolute right-0 z-40 mt-1 flex w-40 flex-col rounded-lg border border-line bg-bg py-1 shadow-sm"
      >
        <Suspense fallback={<NavLinks items={items} variant="menu" onNavigate={close} />}>
          <CurrentNavLinks items={items} variant="menu" onNavigate={close} />
        </Suspense>
      </nav>
    </details>
  );
}
