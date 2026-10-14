import { readdirSync, readFileSync } from "node:fs";
import { expect, test, type Page } from "@playwright/test";
import { parseFrontmatter } from "../src/lib/frontmatter.mjs";

// 홈 화면 확인 (ADR-0008). 캡처는 test-results/에만 남고 커밋하지 않는다.
// 기대값은 사이트 전용 글(content/site/)에서 읽는다. 문구를 고쳐도 테스트는 그대로 두고, 화면에 빠진 것만 잡는다.

type Layer = { name: string; items: string[] };
type Project = { slug: string; order: number; title: string; summary: string; liveUrl: string };

const read = (file: string) => parseFrontmatter(readFileSync(file, "utf8"), file).data;
const home = read("content/site/home.md") as {
  headline: string;
  lines: string[];
  contact: { email: string; github: string };
  layers: Layer[];
};
const projects = readdirSync("content/site/projects")
  .map((f) => read(`content/site/projects/${f}`) as Project)
  .sort((a, b) => a.order - b.order);

// 아직 만들지 않은 페이지. 헤더 링크를 미리 받다가 404가 난다. F2~F4에서 페이지가 생기면 지운다.
const PENDING_ROUTES = ["/work", "/ai", "/resume"];

function collectErrors(page: Page) {
  const errors: string[] = [];
  page.on("console", (msg) => {
    // 응답 실패는 아래 response에서 주소와 함께 따로 본다.
    if (msg.type() === "error" && !msg.text().startsWith("Failed to load resource")) errors.push(msg.text());
  });
  page.on("pageerror", (err) => errors.push(err.message));
  page.on("response", (res) => {
    const { pathname } = new URL(res.url());
    if (res.status() >= 400 && !PENDING_ROUTES.includes(pathname)) errors.push(`${res.status()} ${pathname}`);
  });
  return errors;
}

test("홈이 열리고 콘솔 오류와 실패한 요청이 없다", async ({ page }) => {
  const errors = collectErrors(page);
  const response = await page.goto("/");
  expect(response?.status()).toBe(200);
  await page.waitForLoadState("networkidle");
  expect(errors).toEqual([]);
});

test("문서 언어는 한국어이고, 첫 줄만 영어로 표시한다", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("lang", "ko");
  await expect(page.getByRole("heading", { level: 1 })).toHaveAttribute("lang", "en");
});

test("가로 스크롤이 생기지 않는다", async ({ page }) => {
  await page.goto("/");
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(0);
});

test("헤더에서 Work, AI, Resume로 갈 수 있다", async ({ page }, testInfo) => {
  await page.goto("/");
  if (testInfo.project.name === "mobile") await page.getByText("메뉴").click();
  const nav = page.getByRole("navigation", { name: "주요 메뉴" }).locator("visible=true");
  await expect(nav.getByRole("link", { name: "Work" })).toHaveAttribute("href", "/work");
  await expect(nav.getByRole("link", { name: "AI" })).toHaveAttribute("href", "/ai");
  await expect(nav.getByRole("link", { name: "Resume" })).toHaveAttribute("href", "/resume");
});

test("다크 모드에서는 어두운 바탕을 쓴다", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "dark" });
  await page.goto("/");
  const background = await page.evaluate(() => getComputedStyle(document.documentElement).backgroundColor);
  expect(background).toBe("rgb(15, 16, 17)");
});

test.describe("첫 화면", () => {
  test("첫 줄은 두 줄로 나뉘고, 소개 두 줄과 연락 링크가 있다", async ({ page }) => {
    await page.goto("/");
    const hero = page.getByRole("region", { name: /^Idea to\s+production\.$/ });
    const lines = await hero.getByRole("heading", { level: 1 }).evaluate((h1) => {
      return Math.round(h1.getBoundingClientRect().height / parseFloat(getComputedStyle(h1).lineHeight));
    });
    expect(lines).toBe(2);
    for (const line of home.lines) await expect(hero.getByText(line)).toBeVisible();

    // 연락 링크는 화면 폭에 따라 한쪽만 보인다. 보이는 쪽만 접근성 트리에 남는다.
    const contact = hero.getByRole("list", { name: "연락" });
    await expect(contact).toHaveCount(1);
    await expect(contact.getByRole("link", { name: home.contact.email })).toHaveAttribute("href", `mailto:${home.contact.email}`);
    await expect(contact.getByRole("link", { name: /GitHub/ })).toHaveAttribute("href", home.contact.github);
    await expect(contact.getByRole("link", { name: "이력서 보기" })).toHaveAttribute("href", "/resume");
  });

  test("기술 층 여섯이 순서대로 버튼으로 있다", async ({ page }) => {
    await page.goto("/");
    const buttons = page.getByRole("list", { name: "기술 층" }).getByRole("button");
    await expect(buttons).toHaveCount(home.layers.length);
    for (const [i, layer] of home.layers.entries()) {
      await expect(buttons.nth(i)).toContainText(layer.name);
      await expect(buttons.nth(i)).toContainText(layer.items.join(" · "));
    }
  });

  test("서비스 세 개가 번호, 이름, 라이브 링크로 있다", async ({ page }) => {
    await page.goto("/");
    const items = page.getByRole("list", { name: "운영 중인 서비스" }).getByRole("listitem");
    await expect(items).toHaveCount(projects.length);
    for (const [i, project] of projects.entries()) {
      const item = items.nth(i);
      await expect(item).toContainText(String(project.order).padStart(2, "0"));
      await expect(item).toContainText(project.summary);
      await expect(item.getByRole("link", { name: project.title, exact: true })).toHaveAttribute("href", `#${project.slug}`);
      const live = item.getByRole("link", { name: new RegExp(new URL(project.liveUrl).host) });
      await expect(live).toHaveAttribute("href", project.liveUrl);
      await expect(live).toHaveAttribute("target", "_blank");
    }
  });

  test("서비스 목록과 연락 링크가 스크롤 없이 첫 화면에 들어온다", async ({ page }) => {
    await page.goto("/");
    const height = page.viewportSize()!.height;
    for (const name of ["운영 중인 서비스", "연락"]) {
      const box = await page.getByRole("list", { name }).first().boundingBox();
      expect(box!.y + box!.height, name).toBeLessThanOrEqual(height);
    }
  });
});

test("캡처를 남긴다 (라이트, 다크)", async ({ page }, testInfo) => {
  for (const scheme of ["light", "dark"] as const) {
    await page.emulateMedia({ colorScheme: scheme });
    await page.goto("/");
    await page.screenshot({ path: testInfo.outputPath(`home-${scheme}.png`), fullPage: true });
  }
});
