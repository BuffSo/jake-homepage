import { readFileSync } from "node:fs";
import { expect, test } from "@playwright/test";
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
  cert: { href: string; cta: string };
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

test("제목 아래에 참가자 줄, 덧붙임 줄, 인증서 버튼이 차례로 있다", async ({ page }) => {
  await page.goto(PATH);
  const main = page.locator("main");
  const h1 = (await page.getByRole("heading", { level: 1 }).boundingBox())!;
  const participants = (await main.getByText(`${ax.participants} · ${ax.date}`, { exact: true }).boundingBox())!;
  const extra = (await main.getByText(ax.extra, { exact: true }).boundingBox())!;
  const cert = (await main.getByRole("link", { name: new RegExp(ax.cert.cta) }).first().boundingBox())!;
  expect(participants.y).toBeGreaterThanOrEqual(h1.y + h1.height);
  expect(extra.y).toBeGreaterThanOrEqual(participants.y + participants.height);
  expect(cert.y).toBeGreaterThanOrEqual(extra.y + extra.height);
});

test("인증서 버튼은 새 창으로 인증서를 열고, 본문보다 위에 있다", async ({ page }) => {
  await page.goto(PATH);
  const main = page.locator("main");
  const links = main.getByRole("link", { name: new RegExp(ax.cert.cta) });
  await expect(links).toHaveCount(2);
  for (const link of await links.all()) {
    await expect(link).toHaveAttribute("href", ax.cert.href);
    await expect(link).toHaveAttribute("target", "_blank");
  }
  const cert = (await links.first().boundingBox())!;
  const first = (await main.getByText(ax.body[0], { exact: true }).boundingBox())!;
  expect(cert.y + cert.height).toBeLessThan(first.y);
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

test("첫 화면 안에 결과, 덧붙임, 인증서 버튼이 다 보인다", async ({ page }) => {
  // 카카오톡 같은 메신저에서 링크를 열었을 때 스크롤 없이 결과와 증빙이 보이게 하려는 배치다 (설계 배치 B)
  await page.goto(PATH);
  const cert = (await page.locator("main").getByRole("link", { name: new RegExp(ax.cert.cta) }).first().boundingBox())!;
  expect(cert.y + cert.height).toBeLessThanOrEqual(page.viewportSize()!.height);
});

test("돌아가기 링크와 끝 버튼은 /ai와 인증서로 간다", async ({ page }) => {
  await page.goto(PATH);
  const main = page.locator("main");
  const back = main.getByRole("link", { name: "AI로 일하는 방식" });
  await expect(back).toHaveCount(2);
  for (const link of await back.all()) await expect(link).toHaveAttribute("href", "/ai");
  // 끝 버튼 줄: 인증서 보기, AI로 일하는 방식 순서
  const hrefs = await main.getByRole("link").evaluateAll((els) => els.map((a) => a.getAttribute("href")));
  expect(hrefs.slice(-2)).toEqual([ax.cert.href, "/ai"]);
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
