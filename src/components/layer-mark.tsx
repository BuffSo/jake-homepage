// 헤더의 홈 표시 (docs/02-ia.md 공통 요소). 첫 화면 움직임에서 응축된 사각형이 여섯 층으로 갈라지는 모습을 줄였다.
// 둥근 사각형 덩어리에 바탕색 틈 다섯 줄을 그어 여섯 층으로 나눈다. 가는 선 여러 줄로 그리면 메뉴 아이콘과 헷갈린다.
const STEP = 4.16; // 층 높이 3.2 + 틈 0.96, 여섯 층이 24를 채운다
const GAPS = [1, 2, 3, 4, 5].map((i) => `M0 ${(i * STEP - 0.48).toFixed(2)}H24`).join("");

export function LayerMark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" className={className}>
      <rect width="24" height="24" rx="5" fill="currentColor" />
      <path d={GAPS} stroke="var(--bg)" strokeWidth="0.96" />
    </svg>
  );
}
