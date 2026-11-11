import { readdirSync, readFileSync } from "node:fs";
import { expect, test } from "@playwright/test";
import { parseFrontmatter } from "../src/lib/frontmatter.mjs";
import { capturePath, collectErrors } from "./helpers";

// AI로 일하는 방식 화면 확인 (ADR-0008, docs/02-ia.md /ai). 캡처는 test-results/에만 남고 커밋하지 않는다.
// 기대값은 사이트 전용 글(content/site/)에서 읽는다.

type AiWork = {
  slug: string;
  order: number;
  group: string;
  home?: number;
  title: string;
  result?: string;
  usage?: string;
  links: { label: string; href: string }[];
  more?: string;
  videos?: { order: number; title: string; thumbnailAlt: string; link: { label: string; href: string } }[];
};

const read = (file: string) => parseFrontmatter(readFileSync(file, "utf8"), file).data;
const head = (read("content/site/home.md") as { sections: { ai: { title: string } } }).sections.ai;
const groups = (read("content/site/ai-page.md") as { groups: { id: string; title: string }[] }).groups;
const works = readdirSync("content/site/ai")
  .filter((f) => f.endsWith(".md"))
  .map((f) => read(`content/site/ai/${f}`) as AiWork)
  .sort((a, b) => a.order - b.order);
const details = works.filter((w) => !w.more);
const shorts = works.filter((w) => w.more);
// 영상 목록이 있는 항목(영상 제작). 영상은 order 순서로 그린다.
const withVideos = works.filter((w) => w.videos);
const videosOf = (work: AiWork) => [...work.videos!].sort((a, b) => a.order - b.order);

test("AI 페이지가 열리고 콘솔 오류와 실패한 요청이 없다", async ({ page }) => {
  const errors = collectErrors(page);
  const response = await page.goto("/ai");
  expect(response?.status()).toBe(200);
  await page.waitForLoadState("networkidle");
  expect(errors).toEqual([]);
});

test("브라우저 제목과 페이지 제목이 있다", async ({ page }) => {
  await page.goto("/ai");
  await expect(page).toHaveTitle(`${head.title} · 소재희`);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(head.title);
});

test("가로 스크롤이 생기지 않는다", async ({ page }) => {
  await page.goto("/ai");
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(0);
});

test("목차의 묶음과 항목 링크가 해당 절로 간다", async ({ page }) => {
  await page.goto("/ai");
  const nav = page.getByRole("navigation", { name: "이 페이지의 목차" });
  await expect(nav.getByRole("link")).toHaveCount(groups.length + works.length);
  for (const group of groups) {
    await nav.getByRole("link", { name: group.title, exact: true }).click();
    await expect(page).toHaveURL(new RegExp(`#${group.id}$`));
    await expect(page.getByRole("heading", { level: 2, name: group.title, exact: true })).toBeInViewport();
  }
  for (const work of works) {
    await nav.getByRole("link", { name: work.title, exact: true }).click();
    await expect(page).toHaveURL(new RegExp(`#${work.slug}$`));
    await expect(page.getByRole("heading", { level: 3, name: work.title, exact: true })).toBeInViewport();
  }
});

test("홈 AI 카드의 자세히 보기가 해당 항목으로 간다", async ({ page }) => {
  const homeWorks = works.filter((w) => w.home !== undefined).sort((a, b) => a.home! - b.home!);
  for (const [i, work] of homeWorks.entries()) {
    await page.goto("/");
    const card = page.getByRole("region", { name: head.title }).getByRole("article").nth(i);
    await card.getByRole("link", { name: "자세히 보기" }).click();
    await expect(page).toHaveURL(new RegExp(`/ai#${work.slug}$`));
    await expect(page.getByRole("heading", { level: 3, name: work.title, exact: true })).toBeInViewport();
  }
});

test("상세 항목에 문제, 만든 것, 결과 또는 쓰는 법과 링크가 있다", async ({ page }) => {
  await page.goto("/ai");
  for (const work of details) {
    const item = page.locator(`article#${work.slug}`);
    const terms = item.locator("dt");
    if (work.videos) {
      // 영상 목록이 있는 항목은 공통 단락(문제, 있으면 결과)만 두고, 만든 것과 숫자, 링크는 영상마다 둔다
      await expect(terms).toHaveText(work.result ? ["문제", "결과"] : ["문제"]);
      const cards = item.getByRole("listitem");
      await expect(cards).toHaveCount(work.videos.length);
      for (const [i, video] of videosOf(work).entries()) {
        const card = cards.nth(i);
        await expect(card.getByRole("heading", { level: 4 })).toHaveText(video.title);
        await expect(card.getByRole("img")).toHaveAttribute("alt", video.thumbnailAlt);
        const anchor = card.getByRole("link", { name: new RegExp(video.link.label) });
        await expect(anchor).toHaveAttribute("href", video.link.href);
        await expect(anchor).toHaveAttribute("target", "_blank");
      }
      continue;
    }
    await expect(terms).toHaveText(["문제", "만든 것", work.usage ? "쓰는 법" : "결과"]);
    // 개인 도구는 결과 대신 쓰는 법을 쓴다
    if (work.group === "personal") await expect(terms.last()).toHaveText("쓰는 법");
    for (const link of work.links) {
      const anchor = item.getByRole("link", { name: new RegExp(link.label) });
      await expect(anchor).toHaveAttribute("href", link.href);
      await expect(anchor).toHaveAttribute("target", "_blank");
    }
  }
});

test("영상 칸은 데스크톱에서 두 칸씩 나란히, 모바일에서 위아래로 쌓인다", async ({ page }, testInfo) => {
  for (const work of withVideos) {
    await page.goto("/ai");
    const cards = page.locator(`article#${work.slug}`).getByRole("listitem");
    const boxes = await Promise.all((await cards.all()).map((card) => card.boundingBox()));
    const buttons = await Promise.all(
      (await cards.all()).map((card, i) => card.getByRole("link", { name: new RegExp(videosOf(work)[i].link.label) }).boundingBox()),
    );
    for (const [i, box] of boxes.entries()) {
      expect(box).not.toBeNull();
      if (i === 0) continue;
      const prev = boxes[i - 1]!;
      if (testInfo.project.name === "mobile" || i % 2 === 0) {
        // 모바일은 모든 칸이, 데스크톱은 셋째 칸부터 앞 칸 아래 줄로 간다
        expect(box!.y).toBeGreaterThanOrEqual(prev.y + prev.height);
      } else {
        // 데스크톱은 같은 줄의 두 칸이 위와 버튼 높이를 맞춘다
        expect(Math.abs(box!.y - prev.y)).toBeLessThan(1);
        expect(box!.x).toBeGreaterThan(prev.x);
        expect(Math.abs(buttons[i]!.y - buttons[i - 1]!.y)).toBeLessThan(1);
      }
    }
  }
});

test("짧은 카드는 /work의 AI 절로 보낸다", async ({ page }) => {
  for (const work of shorts) {
    await page.goto("/ai");
    const link = page.locator(`article#${work.slug}`).getByRole("link", { name: "자세히 보기" });
    await expect(link).toHaveAttribute("href", work.more!);
    await link.click();
    await expect(page).toHaveURL(new RegExp(`${work.more}$`));
    await expect(page.locator(work.more!.slice(work.more!.indexOf("#")))).toBeInViewport();
  }
});

const je = read("content/site/jake-english.md") as { title: string };
const entries = [
  ["AI 도구 활용 사례 자세히 보기", "/ai/case"],
  [`${je.title} 자세히 보기`, "/ai/jake-english"],
];

test("머리 아래, 목차 위의 두 입구가 각자 페이지로 간다", async ({ page }) => {
  for (const [name, href] of entries) {
    await page.goto("/ai");
    const entry = page.getByRole("link", { name });
    await expect(entry).toHaveAttribute("href", href);
    // 입구는 목차보다 앞에 있다
    const order = await entry.evaluate((el) => {
      const nav = document.getElementById("page-index")!;
      return el.compareDocumentPosition(nav) & Node.DOCUMENT_POSITION_FOLLOWING;
    });
    expect(order).toBeTruthy();
    // 작은 그림 네 칸은 장식이라 대체 텍스트를 비운다. 링크 이름이 뜻을 말한다.
    await expect(entry.locator("img")).toHaveCount(4);
    for (const image of await entry.locator("img").all()) await expect(image).toHaveAttribute("alt", "");
    await entry.click();
    await expect(page).toHaveURL(new RegExp(`${href}$`));
  }
  // 사례 입구가 Jake English 입구보다 앞이다
  await page.goto("/ai");
  const first = await page.getByRole("link", { name: entries[0][0] }).evaluate((el, selector) => {
    const other = document.querySelector(selector)!;
    return el.compareDocumentPosition(other) & Node.DOCUMENT_POSITION_FOLLOWING;
  }, 'a[href="/ai/jake-english"]');
  expect(first).toBeTruthy();
});

test("데스크톱은 두 입구가 한 줄에 나란히, 모바일은 사례 입구 아래에 Jake English 입구가 있다", async ({ page }, testInfo) => {
  await page.goto("/ai");
  const caseBox = await page.locator('main a[href="/ai/case"]').boundingBox();
  const appBox = await page.locator('main a[href="/ai/jake-english"]').boundingBox();
  expect(caseBox).not.toBeNull();
  expect(appBox).not.toBeNull();
  if (testInfo.project.name === "mobile") {
    expect(appBox!.y).toBeGreaterThanOrEqual(caseBox!.y + caseBox!.height);
  } else {
    expect(Math.abs(appBox!.y - caseBox!.y)).toBeLessThan(1);
    expect(appBox!.x).toBeGreaterThan(caseBox!.x);
  }
});

test("lg 최소 폭에서도 두 입구의 작은 그림 줄이 같은 높이다", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === "mobile", "모바일은 두 입구가 위아래로 쌓인다");
  for (const width of [1024, 1280]) {
    await page.setViewportSize({ width, height: 800 });
    await page.goto("/ai");
    const tops = await Promise.all(
      // 띠 링크의 마지막 자식이 작은 그림 줄 컨테이너다. 사례 띠의 img는 칸 안에서 잘린 큰 그림이라 위치가 다르다.
      ["/ai/case", "/ai/jake-english"].map((href) =>
        page.locator(`main a[href="${href}"]`).first().evaluate((el) => el.lastElementChild!.getBoundingClientRect().top),
      ),
    );
    expect(Math.abs(tops[0] - tops[1])).toBeLessThan(1);
  }
});

test("이미지마다 대체 텍스트가 있고, 내려오면 불러온다", async ({ page }) => {
  await page.goto("/ai");
  // 두 입구의 장식 그림은 위 테스트에서 따로 본다.
  const images = page.locator('main img:not(a[href="/ai/case"] img):not(a[href="/ai/jake-english"] img)');
  const count = await images.count();
  expect(count).toBeGreaterThan(0);
  for (let i = 0; i < count; i++) {
    const image = images.nth(i);
    await expect(image).toHaveAttribute("alt", /\S/);
    await image.scrollIntoViewIfNeeded();
    await expect.poll(() => image.evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth > 0)).toBe(true);
  }
});

test("캡처를 남긴다 (라이트, 다크)", async ({ page }) => {
  for (const scheme of ["light", "dark"] as const) {
    await page.emulateMedia({ colorScheme: scheme });
    await page.goto("/ai");
    await page.screenshot({ path: capturePath(page, `ai-${scheme}`), fullPage: true });
  }
});
