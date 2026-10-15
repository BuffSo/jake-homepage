// 기술 이름 칩. 기술 이름은 고정폭으로 쓴다 (docs/03-design.md 타이포그래피).
export function StackChips({ items }: { items: string[] }) {
  return (
    <ul aria-label="스택" className="flex flex-wrap gap-1.5">
      {items.map((item) => (
        <li
          key={item}
          className="inline-flex h-[1.625rem] items-center rounded-full border border-line px-2.5 font-mono text-[0.6875rem] lg:h-7 lg:text-xs"
        >
          {item}
        </li>
      ))}
    </ul>
  );
}
