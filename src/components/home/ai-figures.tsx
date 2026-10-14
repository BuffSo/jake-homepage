// AI 카드 위쪽의 도식 (docs/02-ia.md 홈 3). 그림 파일 대신 HTML로 그려 글자가 선명하고 다크 모드를 따른다.
// 눈으로 보는 요약이라 스크린 리더에는 숨기고, 같은 내용은 카드 본문에 글로 있다.

const FRAME = "flex h-[11.25rem] flex-col justify-center gap-3 border-b border-line bg-surface px-4 lg:h-[17.5rem] lg:gap-[1.125rem] lg:px-8";
const BOX = "flex items-center justify-center rounded-md border-2 border-fg lg:rounded-lg";
const CORE = "flex grow flex-col items-center justify-center gap-1 rounded-md bg-fg text-bg h-[4.375rem] lg:h-[5.5rem] lg:rounded-lg";

/** Jake Wiki: 자료 → Claude → 위키 */
export function WikiFlow() {
  return (
    <div aria-hidden="true" className={FRAME}>
      <div className="flex items-center gap-2 lg:gap-3.5">
        <div className="flex w-[5.75rem] shrink-0 flex-col gap-1.5 lg:w-[9.375rem] lg:gap-2">
          {["raw/", "clippings/"].map((name) => (
            <div key={name} className={`${BOX} h-8 justify-start! px-2 font-mono text-[0.6875rem] lg:h-10 lg:px-3 lg:text-xs`}>
              {name}
            </div>
          ))}
        </div>
        <span className="lg:text-lg">→</span>
        <div className={CORE}>
          <span className="text-[0.8125rem] font-semibold lg:text-sm">Claude</span>
          <span className="hidden text-[0.6875rem] opacity-75 lg:block">요약 · 교차참조 · 장부</span>
        </div>
        <span className="lg:text-lg">→</span>
        <div className={`${BOX} h-[4.375rem] w-[4.375rem] shrink-0 font-mono text-[0.6875rem] lg:h-[5.5rem] lg:w-[7.5rem] lg:text-xs`}>
          wiki/
        </div>
      </div>
      <span className="text-center text-[0.6875rem] text-subtle lg:text-xs">질문 → 위키 위에서 답 → 좋은 답은 다시 위키에</span>
    </div>
  );
}

/** Jake Hermes: 텔레그램 ⇄ 에이전트 ⇄ 로컬 모델, 그리고 예약 작업 */
export function HermesFlow() {
  const side = `${BOX} h-[3.25rem] w-[4.875rem] shrink-0 flex-col gap-0.5 text-xs font-semibold lg:h-16 lg:w-[8.125rem] lg:text-sm`;
  return (
    <div aria-hidden="true" className={FRAME}>
      <div className="flex items-center gap-1.5 lg:gap-3">
        <div className={side}>텔레그램</div>
        <span className="lg:text-lg">⇄</span>
        <div className={CORE}>
          <span className="text-xs font-semibold lg:text-sm">Hermes Agent</span>
          <span className="hidden text-[0.6875rem] opacity-75 lg:block">내 컴퓨터에서 실행</span>
        </div>
        <span className="lg:text-lg">⇄</span>
        <div className={side}>
          로컬 모델
          <span className="hidden font-mono text-[0.6875rem] font-normal text-muted lg:block">Ollama</span>
        </div>
      </div>
      <div className="self-center rounded-md border-2 border-dashed border-fg px-2.5 py-1.5 text-[0.6875rem] lg:rounded-lg lg:px-3.5 lg:py-2 lg:text-xs">
        예약 작업 · 조사 결과 알림
      </div>
    </div>
  );
}

const STEPS = [
  { name: "기획 문서", path: "docs/01-prd.md" },
  { name: "결정", path: "docs/adr/" },
  { name: "구현", path: "commits" },
  { name: "검사", path: "훅 · CI", gate: true },
  { name: "기록", path: "docs/devlog/" },
];

/** 이 사이트: 다섯 단계 중 검사만 강조색이다 */
export function SiteSteps() {
  return (
    <div aria-hidden="true" className="flex flex-col justify-center gap-1.5 border-b border-line bg-surface p-4 lg:h-[17.5rem] lg:px-8 lg:py-0">
      {STEPS.map((step, i) => (
        <div
          key={step.name}
          className={`flex h-[2.375rem] items-center justify-between rounded-md border-2 px-3 lg:h-[2.625rem] lg:rounded-lg lg:px-3.5 ${
            step.gate ? "border-accent bg-accent text-on-accent" : "border-fg"
          }`}
        >
          <span className="flex items-baseline gap-2 lg:gap-2.5">
            <span className={`font-mono text-[0.6875rem] ${step.gate ? "" : "text-muted"}`}>{String(i + 1).padStart(2, "0")}</span>
            <span className="text-[0.8125rem] font-semibold lg:text-sm">{step.name}</span>
          </span>
          <span className={`font-mono text-[0.6875rem] ${step.gate ? "" : "text-muted"}`}>{step.path}</span>
        </div>
      ))}
    </div>
  );
}
