import { ExternalLink } from "@/components/external-link";
import { InlineScript } from "@/components/inline-script";
import { getHome, getProjects } from "@/lib/content";
import { HeroIntro } from "./hero-intro";
import { INTRO_SCRIPT } from "./intro-script";
import { LayerFocusProvider } from "./layer-focus";
import { techLines } from "./layer-techs";
import { ServiceList, type ServiceItem } from "./service-list";
import { StackLayers } from "./stack-layers";

// 첫 화면의 마지막 장면 (docs/04-motion.md). 서버가 그린 이 HTML이 움직임이 끝난 모습이다.
// data-intro-part가 붙은 것은 움직임이 재생되는 동안 숨겼다가 마지막 박자에 나타난다(hero-intro.tsx).
// 데스크톱(lg 이상)은 글이 왼쪽, 기술 층이 오른쪽, 서비스 목록이 아래 띠다. 그보다 좁으면 위에서 아래로 쌓는다.
export function Hero() {
  const home = getHome();
  const projects = getProjects();
  // 세 서비스의 기술 줄을 모두 겹쳐 둔다. 한 서비스의 줄만 길어도 세 칸이 같은 높이를 잡아 데스크톱에서 주소 줄이 맞는다.
  const allTechLines = [...new Set(projects.flatMap((project) => techLines(home.layers, project.slug)))];
  const services: ServiceItem[] = projects.map((project) => ({
    slug: project.slug,
    num: String(project.order).padStart(2, "0"),
    name: project.title,
    line: project.summary,
    href: project.liveUrl,
    domain: new URL(project.liveUrl).host,
    techLines: allTechLines,
  }));

  // 첫 줄은 마지막 낱말 앞에서 줄을 바꾼다 ("Idea to / production.").
  // 첫 낱말은 윤곽만, 가운데 낱말은 회색, 마지막 낱말은 그라데이션이다(globals.css 첫 줄).
  const words = home.headline.split(" ");
  const [first, last] = [words[0], words[words.length - 1]];
  const middle = words.slice(1, -1).join(" ");
  const [lead, sub] = home.lines;

  return (
    // data-intro는 인라인 스크립트가 붙이고 움직임이 끝나면 지운다. React가 이 속성을 문제 삼지 않게 한다.
    // id와 tabIndex는 맨 위로 버튼이 쓴다. 첫 화면이 사라지면 버튼이 보이고, 누르면 여기에 초점이 온다(back-to-top.tsx).
    <section
      id="hero"
      tabIndex={-1}
      data-hero
      suppressHydrationWarning
      aria-labelledby="hero-title"
      className="flex flex-col gap-3 pt-1 pb-4 lg:min-h-[calc(100svh-4rem)] lg:gap-7 lg:pt-0 lg:pb-5"
    >
      <InlineScript html={INTRO_SCRIPT} />
      <LayerFocusProvider layers={home.layers}>
        <div className="flex flex-col gap-3 lg:grow lg:flex-row lg:items-center lg:gap-12 xl:gap-16">
          <div className="flex flex-col gap-3 lg:w-[26rem] lg:shrink-0 lg:gap-5 xl:w-[31.25rem]">
            <h1
              id="hero-title"
              lang="en"
              className="text-[2.5rem] leading-[1.04] font-extrabold tracking-[-0.03em] md:text-[3.5rem] lg:text-[4rem] lg:leading-[1.02] lg:tracking-[-0.035em] xl:text-[4.75rem]"
            >
              <span className="hero-outline">{first}</span>
              {middle && <span className="text-subtle"> {middle}</span>} <br />
              {/* inline-block이라야 재생 때 얹는 그라데이션 사본이 글자에 정확히 겹친다(intro-play.ts) */}
              <span data-intro-fill className="hero-brand relative inline-block">
                {last}
              </span>
            </h1>
            <div data-intro-part className="flex flex-col gap-1.5 lg:mt-2 lg:gap-5">
              <p className="text-[1.0625rem] leading-[1.4] font-semibold md:text-xl lg:text-[1.375rem]">{lead}</p>
              <p className="text-[0.8125rem] leading-[1.5] text-muted md:text-base lg:leading-[1.6]">{sub}</p>
            </div>
            <Contact email={home.contact.email} github={home.contact.github} />
          </div>
          <StackLayers layers={home.layers}>
            <HeroIntro />
          </StackLayers>
        </div>
        <ServiceList services={services} />
      </LayerFocusProvider>
      <ScrollCue />
    </section>
  );
}

// 첫 화면 아래 가운데의 SCROLL 표시 (docs/02-ia.md 홈 1). 첫 화면이 화면 높이에 맞아 아래 내용이 없어 보이지 않게 한다.
// 마지막 박자에 다른 글과 함께 나타나고(data-intro-part), 멈춘 뒤에는 움직이지 않는다(docs/04-motion.md 멈춘 뒤).
function ScrollCue() {
  return (
    <a
      href="#work"
      data-intro-part
      className="inline-flex min-h-11 min-w-11 flex-col items-center justify-center gap-0.5 self-center font-mono text-[0.625rem] tracking-[0.12em] text-subtle hover:text-fg lg:text-[0.6875rem]"
    >
      SCROLL
      <svg aria-hidden="true" viewBox="0 0 12 12" className="size-3">
        <path d="M2.5 4.5 6 8l3.5-3.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span className="sr-only">운영 중인 서비스로 내려가기</span>
    </a>
  );
}

// 연락 링크. 모든 폭에서 소개 아래에 둔다(2026-10-17). 작은 폰에서도 첫 화면에 이메일과 GitHub가 보이게 하기 위해서다.
// 이력서는 헤더의 Resume와 About의 "이력서 보기"로 가므로 여기에는 두지 않는다.
// 이메일과 서비스처럼 GitHub도 주소(github.com/...)로 보인다. 글자는 링크 주소에서 https://를 뗀 것이다.
function Contact({ email, github }: { email: string; github: string }) {
  const link = "inline-flex min-h-6 items-center underline underline-offset-4";
  return (
    <ul data-intro-part aria-label="연락" className="flex flex-wrap gap-x-4 gap-y-1 text-[0.8125rem] md:gap-x-5 md:text-[0.9375rem] lg:mt-1">
      <li>
        <a href={`mailto:${email}`} className={link}>
          {email}
        </a>
      </li>
      <li>
        <ExternalLink href={github} className={link}>
          {github.replace(/^https:\/\//, "")}
        </ExternalLink>
      </li>
    </ul>
  );
}
