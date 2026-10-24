"use client";

import { Analytics, type BeforeSendEvent } from "@vercel/analytics/next";
import { OPT_OUT_KEY, statsDecision } from "@/lib/stats-opt-out.mjs";

// 페이지 조회를 방문 통계로 보낸다 (ADR-0012). 보내기 전에 운영자 본인이 표시한 브라우저인지 본다.
// beforeSend는 페이지 조회와 바깥 링크 클릭(OutboundClicks의 track)을 모두 거친다.
// 서버 컴포넌트에서는 함수를 넘길 수 없어서, Analytics를 이 클라이언트 컴포넌트에서 그린다.
// 함수 참조가 바뀌면 Analytics가 훅을 다시 등록하므로 모듈 수준에 둔다.
function beforeSend(event: BeforeSendEvent) {
  try {
    const stored = localStorage.getItem(OPT_OUT_KEY) !== null;
    const { optedOut, send } = statsDecision(event.url, stored);
    if (optedOut && !stored) localStorage.setItem(OPT_OUT_KEY, "1");
    if (!optedOut && stored) localStorage.removeItem(OPT_OUT_KEY);
    return send ? event : null;
  } catch {
    // 저장소를 쓸 수 없는 브라우저(일부 사생활 보호 설정)는 표시를 남길 수 없으므로 그대로 센다.
    return event;
  }
}

export function PageViews() {
  return <Analytics beforeSend={beforeSend} />;
}
