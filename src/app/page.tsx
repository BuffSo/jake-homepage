import { getHome } from "@/lib/content";

// 홈 (F1). 첫 화면과 아래 섹션은 다음 단계에서 채운다.
export default function Home() {
  const home = getHome();

  return (
    <main id="main" className="mx-auto w-full max-w-7xl flex-1 px-4 md:px-16">
      <h1 lang="en" className="pt-10 text-[2.5rem] leading-none font-extrabold tracking-[-0.03em]">
        {home.headline}
      </h1>
    </main>
  );
}
