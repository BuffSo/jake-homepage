"use client";

import { useEffect, useRef, type ReactNode } from "react";
import type { Layer } from "@/lib/content";
import { useLayerFocus } from "./layer-focus";

// 기술 층 여섯 (docs/04-motion.md 기술 층). 데스크톱은 첫 화면 오른쪽, 모바일은 소개 아래에 쌓는다.
// 층에 마우스를 올리거나 키보드 포커스가 가면 서비스 목록에 서비스마다 그 층에서 쓴 기술이 보인다(service-list.tsx).
// 터치와 키보드는 눌러서 고정할 수 있고, 층 밖을 누르거나 Esc를 누르면 풀린다.
// children은 층 아래 오른쪽에 두는 다시 보기 버튼이다. 움직임 무대는 층 목록 자리에 얹으므로 바깥을 relative로 둔다.
export function StackLayers({ layers, children }: { layers: Layer[]; children?: ReactNode }) {
  const { active, pinned, toggle, preview, release } = useLayerFocus();
  const listRef = useRef<HTMLUListElement>(null);
  // 마지막으로 층을 누른 포인터의 종류. 키보드로 누르면 pointerdown이 없어 빈 값이다.
  const pointerType = useRef("");

  // 고정한 층은 층 밖을 누르거나 Esc를 누르면 푼다. 그대로 두면 서비스의 한 줄 설명이 계속 가려진다.
  // 층 밖에서 누르고 뗀 것(pointerdown과 pointerup)을 본다. click은 iOS Safari에서 링크나 버튼이 아닌 곳을 탭하면 생기지 않는다.
  // 모바일에서 층을 누른 뒤 아래 목록을 보려고 스크롤하면 브라우저가 pointercancel을 보내므로 풀리지 않는다.
  // 관성으로 미끄러지는 화면을 손가락으로 멈춘 누름은 pointercancel이 없으므로, 스크롤 직후(0.1초 안)의 누름은 세지 않는다.
  // 오른쪽 클릭처럼 주 버튼이 아닌 누름도 세지 않는다.
  useEffect(() => {
    const outside = (e: Event) => !listRef.current?.contains(e.target as Node);
    let pressedOutside = false;
    let scrolledAt = 0;
    const onScroll = () => {
      scrolledAt = performance.now();
    };
    const onPointerDown = (e: PointerEvent) => {
      pressedOutside = e.button === 0 && outside(e) && performance.now() - scrolledAt > 100;
    };
    const onPointerCancel = () => {
      pressedOutside = false;
    };
    const onPointerUp = (e: PointerEvent) => {
      if (pressedOutside && outside(e)) release();
      pressedOutside = false;
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") release();
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    // 화면을 확대한 상태의 스크롤은 visualViewport에서만 온다
    window.visualViewport?.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("pointercancel", onPointerCancel);
    document.addEventListener("pointerup", onPointerUp);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.visualViewport?.removeEventListener("scroll", onScroll);
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("pointercancel", onPointerCancel);
      document.removeEventListener("pointerup", onPointerUp);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [release]);

  return (
    <div className="relative flex flex-col lg:grow">
      <ul ref={listRef} data-intro-layers aria-label="기술 층" className="flex flex-col gap-1 lg:gap-2">
        {layers.map((layer) => (
          <li key={layer.name} data-intro-part="layer">
            <button
              type="button"
              aria-pressed={pinned?.name === layer.name}
              data-active={active?.name === layer.name}
              // 마우스는 올리기만으로 보이므로 눌러도 고정하지 않는다. 고정은 마우스가 없는 터치와 키보드에만 쓴다.
              onPointerDown={(e) => (pointerType.current = e.pointerType)}
              // 키보드로 누른 클릭은 detail이 0이다. 마우스로 누른 채 층 밖에서 떼어 남은 값과 관계없이 고정한다.
              onClick={(e) => {
                const type = pointerType.current;
                pointerType.current = "";
                if (e.detail === 0 || type !== "mouse") toggle(layer.name);
              }}
              // 터치는 누르기만 쓴다. 손가락을 떼도 pointerleave가 오지 않아 미리 보기가 남기 때문이다.
              onPointerEnter={(e) => e.pointerType === "mouse" && preview(layer.name)}
              onPointerLeave={(e) => e.pointerType === "mouse" && preview(null)}
              // 마우스로 눌러 생긴 포커스는 미리 보기로 치지 않는다. 키보드로 옮겨 온 포커스만 보여 준다.
              onFocus={(e) => e.currentTarget.matches(":focus-visible") && preview(layer.name)}
              onBlur={() => preview(null)}
              className="group flex h-11 w-full cursor-pointer items-center justify-between gap-3 rounded-lg border-2 border-fg px-3 text-left transition-colors duration-150 data-[active=true]:border-accent data-[active=true]:bg-accent data-[active=true]:text-on-accent motion-reduce:transition-none md:h-12 md:px-4 lg:h-14 lg:rounded-[0.625rem] lg:px-5"
            >
              <span className="shrink-0 text-sm font-semibold md:text-base">{layer.name}</span>
              <span className="font-mono text-[0.6875rem] text-muted group-data-[active=true]:text-on-accent md:text-[0.8125rem]">
                {layer.items.map((item) => item.name).join(" · ")}
              </span>
            </button>
          </li>
        ))}
      </ul>
      <div data-intro-part className="mt-2 flex items-center justify-end gap-4 lg:mt-1.5 lg:justify-between">
        <p className="hidden text-xs text-subtle lg:block">층에 마우스를 올리면 서비스마다 그 층에서 쓴 기술이 표시됩니다</p>
        {children}
      </div>
    </div>
  );
}
