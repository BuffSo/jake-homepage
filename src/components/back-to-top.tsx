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
    const observer = new IntersectionObserver(([entry]) => {
      setShown(!entry.isIntersecting && entry.boundingClientRect.top < 0);
    });
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
