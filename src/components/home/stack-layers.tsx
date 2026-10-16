"use client";

import type { ReactNode } from "react";
import type { Layer } from "@/lib/content";
import { useLayerFocus } from "./layer-focus";

// 기술 층 여섯 (docs/04-motion.md 기술 층). 데스크톱은 첫 화면 오른쪽, 모바일은 소개 아래에 쌓는다.
// 층을 누르거나 올리면 서비스 목록에 서비스마다 그 층에서 쓴 기술이 보인다(service-list.tsx).
// children은 층 아래 오른쪽에 두는 다시 보기 버튼이다. 움직임 무대는 층 목록 자리에 얹으므로 바깥을 relative로 둔다.
export function StackLayers({ layers, children }: { layers: Layer[]; children?: ReactNode }) {
  const { active, pinned, toggle, preview } = useLayerFocus();

  return (
    <div className="relative flex flex-col lg:grow">
      <ul data-intro-layers aria-label="기술 층" className="flex flex-col gap-1 lg:gap-2">
        {layers.map((layer) => (
          <li key={layer.name} data-intro-part="layer">
            <button
              type="button"
              aria-pressed={pinned?.name === layer.name}
              data-active={active?.name === layer.name}
              onClick={() => toggle(layer.name)}
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
        <p className="hidden text-xs text-subtle lg:block">층을 누르면 서비스마다 그 층에서 쓴 기술이 표시됩니다</p>
        {children}
      </div>
    </div>
  );
}
