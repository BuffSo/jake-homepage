import { Analytics } from "@vercel/analytics/next";
import { OutboundClicks } from "./outbound-clicks";

// 방문 통계 (ADR-0012). 페이지 조회는 Analytics가, 바깥 링크 클릭은 OutboundClicks가 센다.
// Vercel 운영 배포에서만 넣는다. 로컬과 CI의 빌드에는 통계 스크립트 경로(/_vercel/insights)가 없어 404가 나고,
// E2E(e2e/helpers.ts의 collectErrors)는 400 이상 응답을 오류로 센다. 미리보기 배포의 방문도 세지 않는다.
// VERCEL_ENV는 Vercel이 빌드할 때 넣는 값이고, 이 컴포넌트는 빌드 때 그려진다.
export function SiteAnalytics() {
  if (process.env.VERCEL_ENV !== "production") return null;
  return (
    <>
      <Analytics />
      <OutboundClicks />
    </>
  );
}
