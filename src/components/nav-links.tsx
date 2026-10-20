"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type Item = { label: string; href: string; note?: string };
type Props = {
  items: Item[];
  /** bar: 데스크톱 헤더의 가로 메뉴, menu: 모바일 메뉴의 세로 목록 */
  variant: "bar" | "menu";
  onNavigate?: () => void;
};

// 헤더 메뉴의 링크 (docs/02-ia.md 공통 요소). 지금 보는 페이지에는 aria-current와 밑줄을 붙인다.
// 데스크톱은 굵기를 바꾸지 않는다. 페이지를 옮길 때 항목 폭이 달라져 메뉴가 흔들리지 않게 하기 위해서다.
// 모바일은 줄마다 왼쪽에 이름, 오른쪽에 페이지 제목(note)을 둔다. 표시는 이름 글자에만 붙인다.
// 링크에 밑줄을 주면 안의 페이지 제목까지 밑줄이 번진다.
const BAR = { base: "hover:underline", current: "underline decoration-2 underline-offset-4" };
const MENU = {
  row: "flex h-14 items-center justify-between gap-4 border-t border-line-soft px-4 first:border-t-0",
  label: "text-base",
  current: "font-semibold underline decoration-2 underline-offset-4",
  note: "text-sm text-subtle",
};

/**
 * 메뉴 하나가 지금 경로와 어떤 사이인지. 그 페이지면 "page", 그 메뉴 아래의 페이지(/ai/case)면 "true"다.
 * 아래 페이지에서도 밑줄은 같게 붙이고, 화면 읽기 프로그램에는 지금 페이지 자체가 아니라고 알린다(docs/02-ia.md 공통 요소).
 */
function currentState(href: string, current?: string) {
  if (current === href) return "page" as const;
  if (current?.startsWith(`${href}/`)) return "true" as const;
  return undefined;
}

/** 경로를 읽지 않고 그리는 링크. 경로를 알기 전(Suspense 대체 화면)에는 표시 없이 그린다. */
export function NavLinks({ items, variant, onNavigate, current }: Props & { current?: string }) {
  return items.map((item) => {
    const state = currentState(item.href, current);
    const isCurrent = state !== undefined;
    const common = { href: item.href, onClick: onNavigate, "aria-current": state };
    if (variant === "bar") {
      return (
        <Link key={item.href} {...common} className={isCurrent ? `${BAR.base} ${BAR.current}` : BAR.base}>
          {item.label}
        </Link>
      );
    }
    return (
      <Link key={item.href} {...common} className={MENU.row}>
        <span className={isCurrent ? `${MENU.label} ${MENU.current}` : MENU.label}>{item.label}</span>
        {item.note && <span className={MENU.note}>{item.note}</span>}
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
