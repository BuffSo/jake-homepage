import { Fragment } from "react";
import type { AiWork } from "@/lib/content";

// /ai 항목의 머리글과 단락 (docs/02-ia.md /ai, docs/03-design.md F3)

/** 머리글의 영문 이름은 고정폭, 한글 설명은 본문 글꼴로 쓴다 (globals.css 글꼴 순서) */
export function Eyebrow({ text }: { text: string }) {
  const [tag, ...rest] = text.split(" · ");
  return (
    <span className="text-[0.6875rem] text-subtle lg:text-[0.8125rem]">
      <span className="font-mono tracking-[0.04em]">{tag}</span>
      {rest.length > 0 && ` · ${rest.join(" · ")}`}
    </span>
  );
}

/** 문제 · 만든 것 · 결과(개인 도구는 쓰는 법). 데스크톱은 이름 칸을 왼쪽에 둔다. */
export function Facts({ work }: { work: AiWork }) {
  const rows: [string, string | undefined][] = [
    ["문제", work.problem],
    ["만든 것", work.built],
    work.usage ? ["쓰는 법", work.usage] : ["결과", work.result],
  ];
  return (
    <dl className="grid text-sm leading-[1.65] lg:grid-cols-[4.5rem_minmax(0,1fr)] lg:gap-x-4 lg:gap-y-2.5 lg:text-[0.9375rem]">
      {rows.map(([label, text]) => (
        <Fragment key={label}>
          <dt className="mt-2 text-xs text-subtle first:mt-0 lg:mt-0 lg:pt-0.5 lg:text-[0.8125rem]">{label}</dt>
          <dd>{text}</dd>
        </Fragment>
      ))}
    </dl>
  );
}
