// 바깥 링크 클릭을 방문 통계의 커스텀 이벤트 값으로 바꾼다 (ADR-0012).
// 화면(src/components/outbound-clicks.tsx)과 테스트(scripts/lib/outbound.test.mjs)가 같이 쓴다.

// Vercel 커스텀 이벤트는 이름, 키, 값을 각각 255자까지 받는다.
const MAX = 255;

/**
 * 누른 링크가 사이트 밖으로 나가면 { to, from }을, 아니면 null을 돌려준다.
 * to는 목적지의 호스트와 경로다. 쿼리와 해시는 떼고 끝의 /도 뗀다(recueve.com, github.com/BuffSo).
 * 이메일 링크는 주소를 보내지 않고 "email"로 보낸다. from은 누른 페이지의 경로다.
 * @param {string} href 링크 주소 (a.href)
 * @param {string} pageUrl 지금 페이지의 주소 (location.href)
 * @returns {{ to: string, from: string } | null}
 */
export function outboundEvent(href, pageUrl) {
  let page;
  let link;
  try {
    page = new URL(pageUrl);
    link = new URL(href, page);
  } catch {
    return null;
  }
  const from = page.pathname.slice(0, MAX);
  if (link.protocol === "mailto:") return { to: "email", from };
  if (link.protocol !== "http:" && link.protocol !== "https:") return null;
  if (link.host === page.host) return null;
  const to = (link.host + link.pathname).replace(/\/+$/, "");
  return { to: to.slice(0, MAX), from };
}
