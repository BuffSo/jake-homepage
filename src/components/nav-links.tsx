"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type Item = { label: string; href: string };
type Props = {
  items: Item[];
  /** bar: 데스크톱 헤더의 가로 메뉴, menu: 모바일 메뉴의 세로 목록 */
  variant: "bar" | "menu";
  onNavigate?: () => void;
};

// 헤더 메뉴의 링크 (docs/02-ia.md 공통 요소). 지금 보는 페이지에는 aria-current와 밑줄을 붙인다.
// 데스크톱은 굵기를 바꾸지 않는다. 페이지를 옮길 때 항목 폭이 달라져 메뉴가 흔들리지 않게 하기 위해서다.
const LINK_CLASS = {
  bar: { base: "hover:underline", current: "underline decoration-2 underline-offset-4" },
  menu: { base: "flex h-11 items-center px-4 text-sm", current: "font-semibold underline underline-offset-4" },
};

/** 경로를 읽지 않고 그리는 링크. 경로를 알기 전(Suspense 대체 화면)에는 표시 없이 그린다. */
export function NavLinks({ items, variant, onNavigate, current }: Props & { current?: string }) {
  const { base, current: currentClass } = LINK_CLASS[variant];
  return items.map((item) => {
    const isCurrent = item.href === current;
    return (
      <Link
        key={item.href}
        href={item.href}
        onClick={onNavigate}
        aria-current={isCurrent ? "page" : undefined}
        className={isCurrent ? `${base} ${currentClass}` : base}
      >
        {item.label}
      </Link>
    );
  });
}

/**
 * 지금 경로를 읽어 표시하는 링크. 경로는 이 컴포넌트에서만 읽는다.
 * 경로를 미리 알 수 없는 페이지(없는 주소의 404)에서도 헤더가 빌드 때 만들어지도록, 쓰는 쪽에서 Suspense로 감싼다.
 */
export function CurrentNavLinks(props: Props) {
  return <NavLinks {...props} current={usePathname()} />;
}
