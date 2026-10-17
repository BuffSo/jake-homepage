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

  // 층 아래 안내 문구와 같은 색의 리로드 아이콘 하나다(2026-10-17). 테두리 있는 알약 버튼은 첫 화면에서 너무 커 보였고,
  // 다시 볼 일이 드물어 글자로 설명하지 않는다. 이름은 화면 읽기 이름과 아래 툴팁으로만 알린다.
  // 보이는 것은 작아도 누르는 영역은 2.75rem 정사각형이고, 아이콘은 층의 오른쪽 끝에 맞춘다.
  return (
    <button
      ref={ref}
      type="button"
      aria-label="다시 보기"
      onClick={() => {
        const hero = ref.current?.closest<HTMLElement>("[data-hero]");
        if (hero) start(hero, stopRef);
      }}
      className="group relative flex size-11 shrink-0 cursor-pointer items-center justify-end text-subtle hover:text-fg motion-reduce:hidden"
    >
      {/* 툴팁. 브라우저 기본 툴팁(title)은 늦게 뜨거나 뜨지 않는 브라우저가 있어 직접 그린다.
          아이콘 왼쪽 같은 줄에 띄워 다른 글을 가리지 않는다. 마우스를 올리면 0.2초 뒤에 뜨고, 치우면 바로 사라진다.
          hover는 마우스가 있는 기기에서만 걸리므로(Tailwind 4), 탭하면 바로 재생되는 휴대폰에는 뜨지 않는다.
          키보드 초점에도 뜬다. 이름은 aria-label이 알리므로 화면 읽기에서는 숨긴다. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 right-[1.625rem] -translate-y-1/2 rounded-md bg-fg px-2.5 py-1.5 text-xs leading-none whitespace-nowrap text-bg opacity-0 transition-opacity duration-100 group-hover:opacity-100 group-hover:delay-200 group-focus-visible:opacity-100"
      >
        다시 보기
      </span>
      <svg
        aria-hidden="true"
        viewBox="0 0 16 16"
        className="size-4.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M13.25 8a5.25 5.25 0 1 1-1.54-3.71" />
        <path d="M12 1.75V4.5H9.25" />
      </svg>
    </button>
  );
}
