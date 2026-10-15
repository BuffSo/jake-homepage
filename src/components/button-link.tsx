import Link from "next/link";
import type { ReactNode } from "react";
import { ExternalLink } from "./external-link";

const VARIANT = {
  solid: "bg-fg text-bg hover:bg-fg/85",
  outline: "border border-fg/20 hover:border-fg",
};

// 버튼 모양. 모바일은 누르기 쉽게 높이 2.75rem, 데스크톱은 시안대로 2.5rem이다.
// 링크가 아닌 버튼(이력서 인쇄 버튼)도 같은 모양을 쓴다.
export function buttonClass(variant: keyof typeof VARIANT = "outline", className = "") {
  return `inline-flex h-11 items-center justify-center gap-1 rounded-full px-4 text-[0.8125rem] whitespace-nowrap lg:h-10 ${VARIANT[variant]} ${className}`;
}

// 버튼 모양의 링크. 다른 사이트로 가면 새 창으로 열고 ↗를 붙인다.
export function ButtonLink({
  href,
  variant = "outline",
  className = "",
  children,
}: {
  href: string;
  variant?: keyof typeof VARIANT;
  className?: string;
  children: ReactNode;
}) {
  const style = buttonClass(variant, className);
  if (/^https?:\/\//.test(href)) {
    return (
      <ExternalLink href={href} className={style}>
        {children}
        <span aria-hidden="true">↗</span>
      </ExternalLink>
    );
  }
  if (href.startsWith("mailto:")) {
    return (
      <a href={href} className={style}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={style}>
      {children}
    </Link>
  );
}
