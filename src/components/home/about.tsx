import { ButtonLink } from "@/components/button-link";
import { getHome } from "@/lib/content";

// About (docs/02-ia.md 홈 4). 누가 만들었는지 짧게 쓰고, 경력은 이력서로 보낸다. 연락 방법은 여기에만 둔다.
export function About() {
  const { about, contact } = getHome();

  return (
    <section
      aria-labelledby="about-title"
      className="flex flex-col gap-5 border-t border-line pt-14 pb-16 lg:gap-7 lg:pt-24 lg:pb-[7.5rem]"
    >
      <span className="font-mono text-[0.6875rem] tracking-[0.04em] text-subtle lg:text-[0.8125rem]">{about.label}</span>
      <h2 id="about-title" className="text-[1.875rem] leading-[1.25] font-extrabold tracking-[-0.025em] lg:text-5xl lg:leading-[1.2]">
        {about.title}
      </h2>
      <p className="max-w-[48.75rem] text-base leading-[1.7] lg:text-xl">{about.body}</p>
      <figure className="mt-1 flex max-w-[48.75rem] flex-col gap-1.5 border-l-2 border-fg pl-3.5 lg:mt-2 lg:gap-2 lg:pl-5">
        <blockquote className="text-[0.9375rem] leading-[1.6] lg:text-lg">“{about.quote}”</blockquote>
        <figcaption className="text-xs text-subtle">{about.quoteBy}</figcaption>
      </figure>
      <div className="mt-1 flex flex-col gap-2 sm:flex-row sm:flex-wrap lg:mt-2 lg:gap-3">
        <ButtonLink href="/resume" variant="solid" className="px-5 text-sm lg:h-11">
          이력서 보기
        </ButtonLink>
        <ButtonLink href={`mailto:${contact.email}`} className="px-5 text-sm lg:h-11">
          {contact.email}
        </ButtonLink>
        <ButtonLink href={contact.github} className="px-5 text-sm lg:h-11">
          GitHub
        </ButtonLink>
      </div>
    </section>
  );
}
