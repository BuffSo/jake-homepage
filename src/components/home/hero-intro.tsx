"use client";

import { useLayoutEffect, useRef, type RefObject } from "react";
import { PLAYED_KEY } from "./intro-script";

// 첫 화면 움직임의 시작과 다시 보기 (docs/04-motion.md). 재생 코드(intro-play.ts)는 재생할 때만 불러온다.
// 불러오는 동안에는 data-intro가 pending이라 글이 숨겨진 시작 상태가 이어진다. 실패하면 data-intro를 지워 마지막 장면을 남긴다.

function played(): boolean {
  try {
    return sessionStorage.getItem(PLAYED_KEY) !== null;
  } catch {
    return true;
  }
}

function start(hero: HTMLElement, stopRef: RefObject<(() => void) | null>) {
  stopRef.current?.();
  hero.dataset.intro = "pending";
  let cancelled = false;
  stopRef.current = () => {
    cancelled = true;
  };
  import("./intro-play")
    .then(({ play }) => {
      // 그사이 멈췄거나, 인라인 스크립트가 기다리다 마지막 장면을 보여 줬으면 재생하지 않는다.
      if (cancelled || hero.dataset.intro !== "pending") return;
      stopRef.current = play(hero, () => {
        stopRef.current = null;
      });
    })
    .catch(() => {
      stopRef.current = null;
      delete hero.dataset.intro;
    });
}

/** 다시 보기 버튼. 처음 방문했을 때의 재생도 이 컴포넌트가 맡는다. */
export function HeroIntro() {
  const ref = useRef<HTMLButtonElement>(null);
  const stopRef = useRef<(() => void) | null>(null);

  // 그리기 전에 시작해야 마지막 장면이 먼저 보였다가 사라지는 일이 없다.
  useLayoutEffect(() => {
    const hero = ref.current?.closest<HTMLElement>("[data-hero]");
    if (!hero) return;
    // 처음 받은 HTML은 인라인 스크립트가 pending을 붙인다. 다른 페이지에서 링크로 왔을 때는 여기서 조건을 본다.
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (hero.dataset.intro === "pending" || (!reduced && !played())) start(hero, stopRef);
    return () => {
      // 재생 중에 사라지면(개발 모드의 다시 마운트, 다른 페이지로 이동) 다음에 처음부터 재생한다.
      if (!stopRef.current) return;
      stopRef.current();
      stopRef.current = null;
      hero.dataset.intro = "pending";
    };
  }, []);

  return (
    <button
      ref={ref}
      type="button"
      onClick={() => {
        const hero = ref.current?.closest<HTMLElement>("[data-hero]");
        if (hero) start(hero, stopRef);
      }}
      className="h-11 shrink-0 cursor-pointer rounded-full border border-line px-4 text-[0.8125rem] hover:border-fg motion-reduce:hidden"
    >
      다시 보기
    </button>
  );
}
