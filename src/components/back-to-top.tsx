"use client";

import { useEffect, useState } from "react";
import { buttonClass } from "./button-link";

// 맨 위로 가기 버튼 (docs/02-ia.md 공통 요소). 네 페이지 모두 main 바로 뒤에 둔다.
// target은 페이지 위쪽의 길잡이다. 세 페이지는 목차(page-index), 홈은 서비스 목록이 든 첫 화면(hero)이다.
// target이 화면 위로 다 사라지면 보이고, 누르면 맨 위로 올라가 target에 초점을 둔다.
// 버튼이 다시 숨을 때 초점이 갈 곳을 잃지 않게 하기 위해서다. target에는 tabIndex={-1}을 붙여 둔다.
// 자리는 sticky다. 스크롤하는 동안은 화면 아래에 붙고, 페이지 끝에서는 본문 아래 여백(푸터 위)에 멈춰 푸터 링크를 가리지 않는다.
export function BackToTop({ target }: { target: string }) {
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const element = document.getElementById(target);
    if (!element) return;
    // 관찰 영역을 화면 아래로 아주 길게 늘려, target이 화면 위로 사라졌을 때만 '겹치지 않음'이 되게 한다.
    // 화면 크기만 보면 target이 화면을 거치지 않고 위아래로 건너뛸 때(낮은 창에서 End 키나 바로 맨 위로 뛰기) 변화가 잡히지 않는다.
    // 한 번에 여러 변화가 오면 마지막 것이 지금 상태다.
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries.at(-1)!;
        setShown(!entry.isIntersecting && entry.boundingClientRect.top < 0);
      },
      { rootMargin: "0% 0% 100000% 0%" },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [target]);

  const onClick = () => {
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduced ? "instant" : "smooth" });
    document.getElementById(target)?.focus({ preventScroll: true });
  };

  return (
    <div className="sticky bottom-0 z-10 mx-auto h-0 w-full max-w-7xl print:hidden">
      <button
        type="button"
        hidden={!shown}
        onClick={onClick}
        className={buttonClass("outline", "absolute right-4 bottom-4 cursor-pointer bg-bg shadow-sm md:right-16 lg:bottom-8")}
      >
        <span aria-hidden="true">↑</span>
        맨 위로
      </button>
    </div>
  );
}
