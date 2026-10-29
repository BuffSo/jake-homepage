import { BackToTop } from "@/components/back-to-top";
import { About } from "@/components/home/about";
import { AiCards } from "@/components/home/ai-cards";
import { Hero } from "@/components/home/hero";
import { ProfileJsonLd } from "@/components/home/profile-json-ld";
import { ServiceCards } from "@/components/home/service-cards";
import { nextPage } from "@/lib/nav";

// 홈 (F1, docs/02-ia.md 홈). 첫 화면 → 운영 중인 서비스 → AI로 일하는 방식 → About 순서다.
export default function Home() {
  return (
    <>
      <ProfileJsonLd />
      <main id="main" className="mx-auto w-full max-w-7xl flex-1 px-4 md:px-16">
        <Hero />
        <ServiceCards />
        <AiCards />
        <About />
      </main>
      <BackToTop target="hero" next={nextPage("/")} />
    </>
  );
}
