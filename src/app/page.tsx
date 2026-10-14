import { Hero } from "@/components/home/hero";

// 홈 (F1, docs/02-ia.md 홈). 첫 화면 → 운영 중인 서비스 → AI로 일하는 방식 → About 순서다.
export default function Home() {
  return (
    <main id="main" className="mx-auto w-full max-w-7xl flex-1 px-4 md:px-16">
      <Hero />
    </main>
  );
}
