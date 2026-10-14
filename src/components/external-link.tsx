import type { ComponentProps } from "react";

// 다른 사이트로 가는 링크. 새 창에서 열고, 스크린 리더에는 새 창이라고 알린다.
export function ExternalLink({ children, ...props }: Omit<ComponentProps<"a">, "target" | "rel">) {
  return (
    <a {...props} target="_blank" rel="noreferrer">
      {children}
      <span className="sr-only"> (새 창)</span>
    </a>
  );
}
