// 공유 미리보기 그림(src/assets/og-image.png, 1200x630)을 만든다. 모든 페이지가 쓴다(src/lib/site-meta.ts) (docs/guide/SEO_검색과_공유_정책_20261017.md).
//   npm run og:image                         개발 서버(http://localhost:3300)에서 만든다
//   npm run og:image -- http://localhost:3210  다른 주소의 서버에서 만든다
// 떠 있는 서버의 홈을 연 뒤 본문만 그림 카드로 바꿔 찍는다. 그래서 사이트의 글꼴, 색, 첫 줄 모양(.hero-outline, .hero-brand)과
// 머리의 아바타를 그대로 쓴다. 첫 줄, 이름, 아바타, 색이 바뀌면 다시 돌려 그림을 새로 넣는다.
// 그림은 라이트 모드로 찍는다. 메신저는 보는 사람의 다크 모드와 관계없이 같은 그림을 보여 주기 때문이다.

import { fileURLToPath } from "node:url";
import { chromium } from "@playwright/test";

const BASE = process.argv[2] ?? "http://localhost:3300";
const OUT = fileURLToPath(new URL("../src/assets/og-image.png", import.meta.url));
const WIDTH = 1200;
const HEIGHT = 630;

const browser = await chromium.launch();
try {
  const page = await browser.newPage({ viewport: { width: WIDTH, height: HEIGHT }, colorScheme: "light", reducedMotion: "reduce" });
  const res = await page.goto(BASE + "/");
  if (!res?.ok()) throw new Error(`${BASE}/ 를 열지 못했습니다 (${res?.status()}). 서버가 떠 있는지 확인하세요.`);

  // 머리의 아바타는 28px로 줄인 그림이라, 이미지 최적화 주소에서 원본 파일 주소를 꺼내 쓴다.
  const avatar = await page.locator("header img").first().evaluate((img) => {
    const src = new URL(img.currentSrc || img.src, location.href);
    return src.searchParams.get("url") ?? src.pathname;
  });
  const headline = await page.locator("#hero-title").evaluate((h1) => ({
    first: h1.querySelector(".hero-outline")?.textContent ?? "",
    middle: h1.querySelector(".text-subtle")?.textContent ?? "",
    last: h1.querySelector(".hero-brand")?.textContent ?? "",
  }));
  if (!headline.first || !headline.last) throw new Error("첫 줄의 낱말을 찾지 못했습니다. hero.tsx의 클래스 이름을 확인하세요.");

  // 그림 시안 A (docs/design/og/): 첫 줄 두 줄과 아래의 아바타, 이름, 주소. 크기는 그림 픽셀이라 px로 쓴다.
  await page.evaluate(
    ({ avatar, headline, width, height }) => {
      const card = document.createElement("div");
      card.id = "og";
      Object.assign(card.style, {
        width: `${width}px`,
        height: `${height}px`,
        boxSizing: "border-box",
        padding: "72px 80px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        background: "var(--bg)",
        color: "var(--fg)",
      });
      card.innerHTML = `
        <h1 lang="en" style="margin:0;font-size:124px;line-height:1.02;font-weight:800;letter-spacing:-0.035em">
          <span class="hero-outline"></span><span style="color:var(--subtle)"></span><br><span class="hero-brand"></span>
        </h1>
        <div style="display:flex;align-items:center;gap:20px">
          <img alt="" style="width:64px;height:64px;border-radius:999px">
          <span style="font-size:32px;font-weight:700">소재희</span>
          <span style="font-family:var(--font-mono);font-size:26px;color:var(--subtle)">jakeso.dev</span>
        </div>`;
      const [first, middle, last] = card.querySelectorAll("h1 span");
      first.textContent = headline.first;
      middle.textContent = headline.middle;
      last.textContent = headline.last;
      card.querySelector("img").src = avatar;
      document.body.replaceChildren(card);
      document.body.style.margin = "0";
    },
    { avatar, headline, width: WIDTH, height: HEIGHT },
  );
  // 아바타를 다 받을 때까지 기다린다. 받지 못하면 멈춰 있지 말고 오류로 끝낸다.
  await page.locator("#og img").evaluate(
    (img) =>
      new Promise((resolve, reject) => {
        const fail = (why) => reject(new Error(`아바타를 불러오지 못했습니다 (${why}): ${img.src}`));
        if (img.complete) return img.naturalWidth ? resolve() : fail("깨진 그림");
        img.onload = () => resolve();
        img.onerror = () => fail("응답 오류");
        setTimeout(() => fail("10초 넘게 걸림"), 10_000);
      }),
  );
  await page.evaluate(() => document.fonts.ready);
  await page.locator("#og").screenshot({ path: OUT });
  console.log(`미리보기 그림을 만들었습니다 - ${OUT.replace(process.cwd() + "/", "")} (${WIDTH}x${HEIGHT})`);
} finally {
  await browser.close();
}
