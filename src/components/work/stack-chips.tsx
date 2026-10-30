import { techLogo } from "@/lib/tech-logos.mjs";

// 기술 이름 칩. 기술 이름은 고정폭으로 쓴다 (docs/03-design.md 타이포그래피).
// 아는 이름은 앞에 단색 로고를 넣는다. 크기와 사이는 이력서 칩(globals.css .md-chip-logo)과 같다.
// 로고는 글자색으로 칠하고 aria-hidden이라 화면 낭독기는 이름만 읽는다.
export function StackChips({ items }: { items: string[] }) {
  return (
    <ul aria-label="스택" className="flex flex-wrap gap-1.5">
      {items.map((item) => {
        const logo = techLogo(item);
        return (
          <li
            key={item}
            className="inline-flex h-[1.625rem] items-center gap-[0.3125rem] rounded-full border border-line px-2.5 font-mono text-[0.6875rem] lg:h-7 lg:text-xs"
          >
            {logo && (
              <svg viewBox="0 0 24 24" aria-hidden="true" className="size-[0.8125rem] flex-none fill-current">
                <path d={logo} />
              </svg>
            )}
            {item}
          </li>
        );
      })}
    </ul>
  );
}
