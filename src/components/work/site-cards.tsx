import Image, { getImageProps, type StaticImageData } from "next/image";
import aitools from "@/assets/work/aitools.png";
import brainhouse from "@/assets/work/brainhouse.png";
import house9Mobile from "@/assets/work/house9-mobile.png";
import house9 from "@/assets/work/house9.png";
import { ButtonLink } from "@/components/button-link";
import { SectionHead } from "@/components/section-head";
import type { Site, SiteSlug, WorkPage } from "@/lib/content";
import { StackChips } from "./stack-chips";

// 의뢰받아 만든 사이트 (docs/02-ia.md /work). 사실은 content/site/sites/의 글에 있는 것만 쓴다.
// 캡처는 한국어 첫 화면이고, 이메일과 회사 정보가 있는 푸터는 들어오지 않는다.
// 안내서 그림은 휴대폰 화면 세 장을 합친 것이고, 주소와 지도, 와이파이 값이 있는 화면은 넣지 않는다.
const IMAGES: Record<SiteSlug, StaticImageData> = { brainhouse, aitools, house9 };

// 넓은 카드의 그림. 데스크톱 칸은 세로로 길고 모바일 칸은 가로로 길어 그림을 나눠 쓴다.
// 데스크톱에서는 그림이 칸을 채우기만 하고, 카드 높이는 글이 정한다.
function WideImage({ alt }: { alt: string }) {
  const {
    props: { srcSet: desktop, sizes },
  } = getImageProps({ src: house9, alt, sizes: "(min-width: 80rem) 36rem, 50vw" });
  const {
    props: { srcSet: mobile, ...rest },
  } = getImageProps({ src: house9Mobile, alt, sizes: "100vw" });
  return (
    <picture className="relative block lg:w-1/2">
      <source media="(min-width: 64rem)" srcSet={desktop} sizes={sizes} />
      <source srcSet={mobile} />
      <img
        {...rest}
        alt={alt}
        className="h-[12.5rem] w-full border-b border-line object-cover object-top lg:absolute lg:inset-0 lg:h-full lg:border-r lg:border-b-0 lg:object-center"
      />
    </picture>
  );
}

export function SiteCards({ head, sites }: { head: WorkPage["sites"]; sites: Site[] }) {
  return (
    <section
      id="sites"
      aria-labelledby="sites-title"
      className="mt-14 scroll-mt-4 border-t border-line pt-14 pb-18 lg:mt-24 lg:pt-24 lg:pb-30"
    >
      <SectionHead id="sites-title" {...head} />
      <div className="grid gap-5 lg:grid-cols-2 lg:gap-8">
        {sites.map((site) => (
          <article
            key={site.slug}
            className={`flex flex-col overflow-hidden rounded-[0.625rem] border border-line lg:rounded-xl ${site.wide ? "lg:col-span-2 lg:flex-row" : ""}`}
          >
            {site.wide ? (
              <WideImage alt={site.imageAlt} />
            ) : (
              <Image
                src={IMAGES[site.slug]}
                alt={site.imageAlt}
                sizes="(min-width: 80rem) 35rem, (min-width: 64rem) 45vw, 100vw"
                className="h-[12.5rem] w-full border-b border-line object-cover object-left-top lg:h-[18.75rem]"
              />
            )}
            <div className={`flex grow flex-col items-start gap-2.5 p-[1.125rem] lg:gap-3 lg:p-6 ${site.wide ? "lg:w-1/2" : ""}`}>
              <span className="font-mono text-[0.6875rem] tracking-[0.04em] text-subtle lg:text-xs">{site.domain}</span>
              <h3 className="text-[1.1875rem] font-bold lg:text-[1.375rem]">{site.title}</h3>
              <p className="text-sm leading-[1.6] text-muted lg:text-[0.9375rem]">{site.summary}</p>
              {site.workflow && (
                <div className="flex w-full flex-col gap-2 rounded-lg border border-line-soft bg-surface px-3.5 py-3 lg:rounded-[0.625rem] lg:px-4 lg:py-3.5">
                  <p className="text-[0.8125rem] leading-[1.6] lg:text-sm">{site.workflow}</p>
                  {site.flow && (
                    <p className="font-mono text-[0.6875rem] leading-[1.6] text-muted lg:text-xs">{site.flow}</p>
                  )}
                </div>
              )}
              {site.notes && (
                <div className="flex w-full flex-col gap-2 rounded-lg border border-line-soft bg-surface px-3.5 py-3 lg:rounded-[0.625rem] lg:px-4 lg:py-3.5">
                  {site.notes.map((note) => (
                    <p key={note.label} className="text-[0.8125rem] leading-[1.6] lg:text-sm">
                      <strong>{note.label}:</strong> {note.text}
                    </p>
                  ))}
                </div>
              )}
              <p className="text-xs leading-[1.6] text-subtle">
                {site.role} · {site.period} · {site.commits}
              </p>
              <StackChips items={site.stack} />
              {site.liveUrl && (
                <div className="mt-auto flex flex-wrap gap-2 pt-1 lg:pt-2">
                  <ButtonLink href={site.liveUrl} variant="solid">
                    사이트 열기
                  </ButtonLink>
                </div>
              )}
              {site.closed && <p className="mt-auto pt-1 text-xs leading-[1.6] text-subtle lg:pt-2">{site.closed}</p>}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
