import type { AiGroup, AiWork } from "@/lib/content";

// /ai 목차 (docs/02-ia.md /ai). 데스크톱은 묶음 네 칸, 모바일은 묶음마다 한 줄이다. 화면에 고정하지 않는다.
type Group = { id: AiGroup; title: string; works: AiWork[] };

export function AiIndex({ groups }: { groups: Group[] }) {
  return (
    <nav aria-label="이 페이지의 목차" className="border-t border-b border-t-fg border-b-line">
      <ul className="grid lg:grid-cols-4">
        {groups.map((group, i) => (
          <li key={group.id} className={i > 0 ? "border-t border-line-soft lg:border-t-0 lg:border-l" : ""}>
            <div className={`flex flex-col gap-1 py-3.5 lg:h-full lg:gap-2.5 lg:pt-5 lg:pr-5 lg:pb-[1.375rem] ${i > 0 ? "lg:pl-5" : ""}`}>
              <span className="font-mono text-[0.6875rem] text-subtle lg:text-xs">{String(i + 1).padStart(2, "0")}</span>
              <a href={`#${group.id}`} className="text-base font-bold hover:text-accent lg:text-lg">
                {group.title}
              </a>
              <ul className="flex flex-wrap gap-x-3.5 text-[0.8125rem] text-muted lg:flex-col lg:gap-1 lg:text-sm">
                {group.works.map((work) => (
                  <li key={work.slug}>
                    <a href={`#${work.slug}`} className="inline-block py-1 hover:text-accent lg:py-0">
                      {work.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </li>
        ))}
      </ul>
    </nav>
  );
}
