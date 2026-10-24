"use client";

import { track } from "@vercel/analytics";
import { useEffect } from "react";
import { outboundEvent } from "@/lib/outbound.mjs";

// 사이트 밖으로 나가는 링크를 누르면 방문 통계에 커스텀 이벤트를 하나 보낸다 (ADR-0012).
// 링크마다 코드를 달지 않고 문서 전체의 클릭을 여기서 잡는다. 마크다운 원문의 링크도 함께 잡힌다.
// 가운데 버튼으로 새 탭에 여는 것은 click이 아니라 auxclick으로 온다. 오른쪽 메뉴로 여는 것은 잡지 못한다.
export function OutboundClicks() {
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (event.type === "auxclick" && event.button !== 1) return;
      const link = event.target instanceof Element ? event.target.closest("a[href]") : null;
      if (!(link instanceof HTMLAnchorElement)) return;
      const data = outboundEvent(link.href, location.href);
      if (data) track("outbound", data);
    };
    document.addEventListener("click", onClick);
    document.addEventListener("auxclick", onClick);
    return () => {
      document.removeEventListener("click", onClick);
      document.removeEventListener("auxclick", onClick);
    };
  }, []);

  return null;
}
