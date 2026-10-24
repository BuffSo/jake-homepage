// 운영자 본인의 방문을 방문 통계에서 빼는 규칙 (ADR-0012).
// 화면(src/components/page-views.tsx)과 테스트(scripts/lib/stats-opt-out.test.mjs)가 같이 쓴다.
// Vercel은 방문자를 식별하지 않으므로, 본인 브라우저에서 ?stats=off를 한 번 열어 표시를 남긴다.

// 표시를 남기는 localStorage 키다. 쿠키가 아니고 어디로도 보내지 않는다.
export const OPT_OUT_KEY = "stats-off";

/**
 * 통계 기록 하나를 보낼지와, 이 브라우저를 계속 빼 둘지를 정한다.
 * 주소에 stats=off가 있으면 이 브라우저를 빼 두고, stats=on이 있으면 다시 센다.
 * 표시를 켜고 끄는 방문은 어느 쪽이든 보내지 않는다. 다른 값이거나 주소를 읽지 못하면 표시를 그대로 둔다.
 * @param {string} url 기록의 주소 (beforeSend가 받는 event.url)
 * @param {boolean} optedOut 이 브라우저에 표시가 있는지
 * @returns {{ optedOut: boolean, send: boolean }}
 */
export function statsDecision(url, optedOut) {
  let value;
  try {
    value = new URL(url).searchParams.get("stats")?.toLowerCase();
  } catch {
    value = undefined;
  }
  if (value === "off") return { optedOut: true, send: false };
  if (value === "on") return { optedOut: false, send: false };
  return { optedOut, send: !optedOut };
}
