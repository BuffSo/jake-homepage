import type { Layer } from "@/lib/content";

// 기술 층 여섯 (docs/04-motion.md 기술 층). 데스크톱은 첫 화면 오른쪽, 모바일은 소개 아래에 쌓는다.
export function StackLayers({ layers }: { layers: Layer[] }) {
  return (
    <div className="flex flex-col lg:grow">
      <ul aria-label="기술 층" className="flex flex-col gap-1 lg:gap-2">
        {layers.map((layer) => (
          <li key={layer.name}>
            <button
              type="button"
              className="flex h-11 w-full cursor-pointer items-center justify-between gap-3 rounded-lg border-2 border-fg px-3 text-left md:h-12 md:px-4 lg:h-14 lg:rounded-[0.625rem] lg:px-5"
            >
              <span className="shrink-0 text-sm font-semibold md:text-base">{layer.name}</span>
              <span className="font-mono text-[0.6875rem] text-muted md:text-[0.8125rem]">{layer.items.join(" · ")}</span>
            </button>
          </li>
        ))}
      </ul>
      <p className="mt-3.5 hidden text-xs text-subtle lg:block">층을 누르면 그 기술을 쓴 서비스가 표시됩니다</p>
    </div>
  );
}
