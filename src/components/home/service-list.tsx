import { ExternalLink } from "@/components/external-link";

export type ServiceItem = { slug: string; num: string; name: string; line: string; href: string; domain: string };

// 첫 화면의 증거 목록 (docs/02-ia.md 홈 1). 번호는 아래 서비스 카드와 같고, 이름을 누르면 그 카드로 내려간다.
// 모바일은 이름 줄 오른쪽에 주소를, 데스크톱은 설명 아래에 주소를 둔다. 읽는 순서는 둘 다 이름, 설명, 주소다.
export function ServiceList({ services }: { services: ServiceItem[] }) {
  return (
    <ol
      aria-label="운영 중인 서비스"
      className="flex flex-col gap-2 border-t border-line pt-2.5 lg:grid lg:grid-cols-3 lg:gap-10 lg:pt-5"
    >
      {services.map((service) => (
        <li
          key={service.slug}
          className="grid grid-cols-[1fr_auto] content-start gap-x-2 gap-y-0.5 [grid-template-areas:'name_domain'_'line_line'] lg:grid-cols-1 lg:gap-y-1.5 lg:[grid-template-areas:'name'_'line'_'domain']"
        >
          <div className="flex items-center gap-1.5 [grid-area:name] lg:gap-2">
            <span aria-hidden="true" className="size-[0.4375rem] shrink-0 rounded-xs bg-subtle/40 lg:size-2" />
            <span className="font-mono text-[0.6875rem] text-subtle md:text-[0.8125rem]">{service.num}</span>
            <a href={`#${service.slug}`} className="text-sm font-bold hover:underline md:text-base">
              {service.name}
            </a>
          </div>
          <p className="text-xs leading-[1.45] text-muted [grid-area:line] md:text-sm lg:leading-[1.5]">{service.line}</p>
          <ExternalLink
            href={service.href}
            className="self-center justify-self-end font-mono text-[0.6875rem] underline underline-offset-4 [grid-area:domain] md:text-[0.8125rem] lg:justify-self-start"
          >
            {service.domain}
          </ExternalLink>
        </li>
      ))}
    </ol>
  );
}
