"use client";

// HTML을 읽는 중에 바로 실행되는 스크립트 (node_modules/next/dist/docs/01-app/02-guides/preventing-flash-before-hydration.md).
// 처음 받은 HTML에서만 실행된다. 클라이언트에서 그릴 때는 text/plain이라 실행되지 않고, React도 경고하지 않는다.
export function InlineScript({ html }: { html: string }) {
  return (
    <script
      type={typeof window === "undefined" ? "text/javascript" : "text/plain"}
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
