"use client";

import { ExternalLink } from "@/components/external-link";
import type { ProjectSlug } from "@/lib/content";
import { useLayerFocus } from "./layer-focus";
import { layerTechs, techLine } from "./layer-techs";

export type ServiceItem = {
  slug: ProjectSlug;
  num: string;
  name: string;
  line: string;
  href: string;
  domain: string;
  /** 모든 층 중 가장 긴 기술 줄. 이 줄이 들어갈 자리를 미리 잡는다. */
  longestTechs: string;
};

// 쓴 기술 줄과 그 자리를 잡는 줄이 같은 글자를 써야 높이가 맞는다.
const TECH_LINE = "font-mono text-[0.6875rem] leading-[1.6] md:text-[0.8125rem] lg:leading-[1.65]";

// 첫 화면의 증거 목록 (docs/02-ia.md 홈 1). 번호는 아래 서비스 카드와 같고, 이름을 누르면 그 카드로 내려간다.
// 모바일은 이름 줄 오른쪽에 주소를, 데스크톱은 설명 아래에 주소를 둔다. 읽는 순서는 둘 다 이름, 설명, 주소다.
// 기술 층을 강조하면 서비스마다 그 층에서 쓴 기술이 한 줄 설명 자리에 보이고, 표식이 강조색이 된다.
// 그 층의 기술을 하나도 쓰지 않은 서비스만 흐려진다. 층 하나에 서비스를 묶으면 기술마다 쓴 서비스가 달라 사실과 어긋난다.
export function ServiceList({ services }: { services: ServiceItem[] }) {
  const { active, pinned } = useLayerFocus();
  const announced = pinned
    ? `${pinned.name} 층: ${services
        .map((s) => {
          const used = layerTechs(pinned, s.slug);
          return `${s.name} ${used.length ? used.join(", ") : "쓰지 않음"}`;
        })
        .join(" / ")}`
    : "";

  return (
    <>
      <ol
        data-intro-part
        aria-label="운영 중인 서비스"
        className="flex flex-col gap-2 border-t border-line pt-2.5 lg:grid lg:grid-cols-3 lg:gap-10 lg:pt-5"
      >
        {services.map((service) => {
          const used = layerTechs(active, service.slug);
          const state = !active ? "idle" : used.length ? "hit" : "dim";
          return (
            <li
              key={service.slug}
              data-state={state}
              className="group grid grid-cols-[1fr_auto] content-start gap-x-2 gap-y-0.5 transition-opacity duration-150 [grid-template-areas:'name_domain'_'line_line'] data-[state=dim]:opacity-30 motion-reduce:transition-none lg:grid-cols-1 lg:gap-y-1.5 lg:[grid-template-areas:'name'_'line'_'domain']"
            >
              <div className="flex items-center gap-1.5 [grid-area:name] lg:gap-2">
                <span
                  aria-hidden="true"
                  className="size-[0.4375rem] shrink-0 rounded-xs bg-subtle/40 group-data-[state=hit]:bg-accent lg:size-2"
                />
                <span className="font-mono text-[0.6875rem] text-subtle md:text-[0.8125rem]">{service.num}</span>
                <a href={`#${service.slug}`} className="text-sm font-bold hover:underline md:text-base">
                  {service.name}
                </a>
              </div>
              {/* 설명, 가장 긴 기술 줄, 쓴 기술을 한 칸에 겹친다. 칸 높이는 설명과 가장 긴 기술 줄 중 큰 쪽이다.
                  쓴 기술이 보이는 동안 설명은 자리만 남는다. 그래서 층을 눌러도 목록 높이가 바뀌지 않는다. */}
              <div className="grid content-start [grid-area:line] *:col-start-1 *:row-start-1">
                <p className="text-xs leading-[1.45] text-muted group-data-[state=hit]:invisible md:text-sm lg:leading-[1.5]">
                  {service.line}
                </p>
                <p aria-hidden="true" className={`invisible ${TECH_LINE}`}>
                  {service.longestTechs}
                </p>
                {state === "hit" && <p className={TECH_LINE}>{techLine(used)}</p>}
              </div>
              <ExternalLink
                href={service.href}
                className="self-center justify-self-end font-mono text-[0.6875rem] underline underline-offset-4 [grid-area:domain] md:text-[0.8125rem] lg:justify-self-start"
              >
                {service.domain}
              </ExternalLink>
            </li>
          );
        })}
      </ol>
      {/* 흐려지는 것은 눈으로만 보이므로, 누른 결과를 스크린 리더에 읽어 준다. */}
      <p aria-live="polite" className="sr-only">
        {announced}
      </p>
    </>
  );
}
