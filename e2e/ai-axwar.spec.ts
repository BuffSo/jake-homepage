import { readFileSync } from "node:fs";
import { expect, test, type Page } from "@playwright/test";
import { parseFrontmatter } from "../src/lib/frontmatter.mjs";
import { capturePath, collectErrors } from "./helpers";

// AX인재전쟁 대회 결과 화면 확인 (docs/02-ia.md /ai/axwar). 캡처는 test-results/에만 남고 커밋하지 않는다.
// 기대값은 사이트 전용 글(content/site/axwar.md)에서 읽는다. 문구가 바뀌어도 테스트는 그대로다.

const ax = parseFrontmatter(readFileSync("content/site/axwar.md", "utf8"), "axwar.md").data as {
  title: string;
  contest: string;
  result: string;
  participants: string;
  date: string;
  extra: string;
  cert: { href: string; title: string; domain: string; cta: string };
  body: string[];
};

const PATH = "/ai/axwar";

test("페이지가 열리고 콘솔 오류와 실패한 요청이 없다", async ({ page }) => {
  const errors = collectErrors(page);
  const response = await page.goto(PATH);
  expect(response?.status()).toBe(200);
  await page.waitForLoadState("networkidle");
  expect(errors).toEqual([]);
});

test("브라우저 제목, 머리글, 제목이 글과 같다", async ({ page }) => {
  await page.goto(PATH);
  await expect(page).toHaveTitle(`${ax.title} · 소재희`);
  // 화면에는 대회 이름 줄과 큰 결과 두 줄이지만 h1 하나라, 무엇의 결과인지 함께 읽힌다
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(`${ax.contest} ${ax.result}`);
  await expect(page.locator("main").getByText("AI / AWARD", { exact: true })).toBeVisible();
});

// 인증서는 링크드인 게시물의 링크 카드처럼 그림, 제목, 도메인을 담은 카드 하나로 보여 준다(2026-11-27 비교판 B)
// 끝 줄의 인증서 보기 버튼도 같은 주소라, 카드는 그림이 든 링크로 찾는다
const certCard = (page: Page) => page.locator("main").locator(`a[href="${ax.cert.href}"]:has(img)`);

test("제목 아래에 참가자 줄, 인증서 카드, 덧붙임 줄이 차례로 있다", async ({ page }) => {
  await page.goto(PATH);
  const main = page.locator("main");
  const h1 = (await page.getByRole("heading", { level: 1 }).boundingBox())!;
  const participants = (await main.getByText(`${ax.participants} · ${ax.date}`, { exact: true }).boundingBox())!;
  const extra = (await main.getByText(ax.extra, { exact: true }).boundingBox())!;
  const cert = (await certCard(page).boundingBox())!;
  expect(participants.y).toBeGreaterThanOrEqual(h1.y + h1.height);
  expect(cert.y).toBeGreaterThanOrEqual(participants.y + participants.height);
  // 덧붙임 줄은 카드 테두리 밖, 카드 아래에 띄워 둔다(모바일 1rem, 데스크톱 1.5rem, 2026-11-27 비교판).
  // 카드의 설명 글처럼 붙어 보이면 인증서가 이 보상까지 증명하는 것으로 읽힐 수 있다
  const gap = page.viewportSize()!.width >= 1024 ? 24 : 16;
  expect(extra.y - (cert.y + cert.height)).toBeGreaterThanOrEqual(gap - 1);
});

test("인증서는 카드 하나이고, 그림·제목·도메인을 담아 새 창으로 열고, 본문보다 위에 있다", async ({ page }) => {
  await page.goto(PATH);
  const card = certCard(page);
  await expect(card).toHaveCount(1);
  await expect(card).toHaveAttribute("target", "_blank");
  await expect(card.getByText(ax.cert.title, { exact: true })).toBeVisible();
  await expect(card.getByText(ax.cert.domain)).toBeVisible();
  // 그림은 저장소에 받아 둔 인증서 공유 그림(1200×630)이고 다 불러온다
  const img = card.locator("img");
  await expect(img).toHaveCount(1);
  const size = await img.evaluate((el: HTMLImageElement) => ({ natural: el.naturalWidth, w: el.clientWidth, h: el.clientHeight }));
  expect(size.natural).toBeGreaterThan(0);
  expect(size.w / size.h).toBeCloseTo(1200 / 630, 1);
  const box = (await card.boundingBox())!;
  const first = (await page.locator("main").getByText(ax.body[0], { exact: true }).boundingBox())!;
  expect(box.y + box.height).toBeLessThan(first.y);
  // 데스크톱은 30rem까지, 모바일은 본문 폭 전체
  const vw = page.viewportSize()!.width;
  if (vw >= 1024) expect(box.width).toBeLessThanOrEqual(480);
  else expect(box.width).toBeGreaterThan(vw - 64);
});

test("본문은 글의 네 문단 그대로이고 차례대로다", async ({ page }) => {
  await page.goto(PATH);
  const main = page.locator("main");
  let last = -1;
  for (const paragraph of ax.body) {
    const text = main.getByText(paragraph, { exact: true });
    await expect(text).toBeVisible();
    const box = (await text.boundingBox())!;
    expect(box.y).toBeGreaterThan(last);
    last = box.y;
  }
});

test("첫 화면 안에 결과, 덧붙임, 인증서 카드가 다 보인다", async ({ page }) => {
  // 카카오톡 같은 메신저에서 링크를 열었을 때 스크롤 없이 결과와 증빙이 보이게 하려는 배치다 (설계 배치 B)
  await page.goto(PATH);
  const cert = (await certCard(page).boundingBox())!;
  const extra = (await page.locator("main").getByText(ax.extra, { exact: true }).boundingBox())!;
  expect(Math.max(cert.y + cert.height, extra.y + extra.height)).toBeLessThanOrEqual(page.viewportSize()!.height);
});

test("돌아가기 링크는 /ai로 가고, 끝 줄은 인증서 보기와 AI로 일하는 방식이다", async ({ page }) => {
  await page.goto(PATH);
  const main = page.locator("main");
  const back = main.getByRole("link", { name: "AI로 일하는 방식" });
  await expect(back).toHaveCount(2);
  for (const link of await back.all()) await expect(link).toHaveAttribute("href", "/ai");
  // main의 링크는 돌아가기, 인증서 카드, 끝 줄의 인증서 보기와 AI로 일하는 방식 넷이다.
  // 끝 줄의 인증서 버튼은 카드 하나로 줄였다가 사용자 요청으로 되살렸다(2026-11-27). 카드 근처에는 버튼을 두지 않는다
  const hrefs = await main.getByRole("link").evaluateAll((els) => els.map((a) => a.getAttribute("href")));
  expect(hrefs).toEqual(["/ai", ax.cert.href, ax.cert.href, "/ai"]);
  // 끝 줄의 인증서 버튼은 바깥 주소라 새 창으로 열고, 본문 마지막 문단보다 아래에 있다
  const button = main.getByRole("link", { name: new RegExp(`^${ax.cert.cta}`) });
  await expect(button).toHaveCount(1);
  await expect(button).toHaveAttribute("target", "_blank");
  const last = (await main.getByText(ax.body.at(-1)!, { exact: true }).boundingBox())!;
  const box = (await button.boundingBox())!;
  expect(box.y).toBeGreaterThanOrEqual(last.y + last.height);
});

test("가로 스크롤이 생기지 않는다 (지금 폭과 320)", async ({ page }) => {
  for (const width of [page.viewportSize()!.width, 320]) {
    await page.setViewportSize({ width, height: 800 });
    // 없는 페이지(404)의 화면으로 통과하지 않게 응답부터 본다
    expect((await page.goto(PATH))?.status()).toBe(200);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow, `${width}px`).toBeLessThanOrEqual(0);
  }
});

test("캡처를 남긴다 (라이트, 다크)", async ({ page }) => {
  for (const scheme of ["light", "dark"] as const) {
    await page.emulateMedia({ colorScheme: scheme });
    expect((await page.goto(PATH))?.status()).toBe(200);
    await page.screenshot({ path: capturePath(page, `ai-axwar-${scheme}`), fullPage: true });
  }
});
