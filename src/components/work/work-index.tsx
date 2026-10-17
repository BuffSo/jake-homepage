// 페이지 목차 (docs/02-ia.md /work). 화면에 고정하지 않는다.
// 목차가 화면 위로 사라지면 맨 위로 버튼이 보이고, 누르면 목차에 초점이 온다(back-to-top.tsx).
type Item = { href: string; num: string; name: string; note: string };

export function WorkIndex({ items }: { items: Item[] }) {
  return (
    <nav id="page-index" tabIndex={-1} aria-label="이 페이지의 목차" className="border-t border-b border-t-fg border-b-line">
      <ul className="grid lg:grid-cols-4">
        {items.map((item, i) => (
          <li key={item.href} className={i > 0 ? "border-t border-line-soft lg:border-t-0 lg:border-l" : ""}>
            <a
              href={item.href}
              className={`flex min-h-14 items-center gap-3.5 py-2 hover:text-accent lg:h-full lg:flex-col lg:items-start lg:gap-1.5 lg:pt-5 lg:pr-5 lg:pb-[1.375rem] ${i > 0 ? "lg:pl-5" : ""}`}
            >
              <span className="w-10 shrink-0 font-mono text-[0.6875rem] text-subtle lg:w-auto lg:text-xs">
                {item.num}
              </span>
              <span className="flex flex-col gap-0.5 lg:gap-1.5">
                <span className="text-base font-bold lg:text-lg">{item.name}</span>
                <span className="text-[0.8125rem] text-muted lg:text-sm">{item.note}</span>
              </span>
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
