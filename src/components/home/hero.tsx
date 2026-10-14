import Link from "next/link";
import { ExternalLink } from "@/components/external-link";
import { getHome, getProjects } from "@/lib/content";
import { ServiceList, type ServiceItem } from "./service-list";
import { StackLayers } from "./stack-layers";

// 첫 화면의 마지막 장면 (docs/04-motion.md). 서버가 그린 이 HTML이 움직임이 끝난 모습이다.
// 데스크톱(lg 이상)은 글이 왼쪽, 기술 층이 오른쪽, 서비스 목록이 아래 띠다. 그보다 좁으면 위에서 아래로 쌓는다.
export function Hero() {
  const home = getHome();
  const services: ServiceItem[] = getProjects().map((project) => ({
    slug: project.slug,
    num: String(project.order).padStart(2, "0"),
    name: project.title,
    line: project.summary,
    href: project.liveUrl,
    domain: new URL(project.liveUrl).host,
  }));

  // 첫 줄은 마지막 낱말 앞에서 줄을 바꾼다 ("Idea to / production.").
  const cut = home.headline.lastIndexOf(" ");
  const [lead, sub] = home.lines;

  return (
    <section
      aria-labelledby="hero-title"
      className="flex flex-col gap-3 pt-1 pb-10 lg:min-h-[calc(100svh-4rem)] lg:gap-7 lg:pt-0 lg:pb-10"
    >
      <div className="flex flex-col gap-3 lg:grow lg:flex-row lg:items-center lg:gap-12 xl:gap-16">
        <div className="flex flex-col gap-3 lg:w-[26rem] lg:shrink-0 lg:gap-5 xl:w-[31.25rem]">
          <h1
            id="hero-title"
            lang="en"
            className="text-[2.5rem] leading-[1.04] font-extrabold tracking-[-0.03em] md:text-[3.5rem] lg:text-[4rem] lg:leading-[1.02] lg:tracking-[-0.035em] xl:text-[4.75rem]"
          >
            {home.headline.slice(0, cut)} <br />
            {home.headline.slice(cut + 1)}
          </h1>
          <div className="flex flex-col gap-1.5 lg:mt-2 lg:gap-5">
            <p className="text-[1.0625rem] leading-[1.4] font-semibold md:text-xl lg:text-[1.375rem]">{lead}</p>
            <p className="text-[0.8125rem] leading-[1.5] text-muted md:text-base lg:leading-[1.6]">{sub}</p>
          </div>
          <Contact email={home.contact.email} github={home.contact.github} className="hidden lg:mt-1 lg:flex" />
        </div>
        <StackLayers layers={home.layers} />
      </div>
      <ServiceList services={services} />
      <Contact email={home.contact.email} github={home.contact.github} className="flex lg:hidden" />
    </section>
  );
}

// 연락 링크. 데스크톱은 소개 아래, 모바일은 첫 화면 맨 아래에 두므로 두 번 그리고 한쪽만 보인다.
function Contact({ email, github, className }: { email: string; github: string; className: string }) {
  const link = "inline-flex min-h-6 items-center underline underline-offset-4";
  return (
    <ul aria-label="연락" className={`flex-wrap gap-x-4 gap-y-1 text-[0.8125rem] md:gap-x-5 md:text-[0.9375rem] ${className}`}>
      <li>
        <a href={`mailto:${email}`} className={link}>
          {email}
        </a>
      </li>
      <li>
        <ExternalLink href={github} className={link}>
          GitHub
        </ExternalLink>
      </li>
      <li>
        <Link href="/resume" className={link}>
          이력서 보기
        </Link>
      </li>
    </ul>
  );
}
