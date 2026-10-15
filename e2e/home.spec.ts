import { readdirSync, readFileSync } from "node:fs";
import { expect, test, type Page } from "@playwright/test";
import { parseFrontmatter } from "../src/lib/frontmatter.mjs";
import { collectErrors } from "./helpers";

// 홈 화면 확인 (ADR-0008). 캡처는 test-results/에만 남고 커밋하지 않는다.
// 기대값은 사이트 전용 글(content/site/)에서 읽는다. 문구를 고쳐도 테스트는 그대로 두고, 화면에 빠진 것만 잡는다.

type Layer = { name: string; items: string[]; usedBy: string[] };
type Project = {
  slug: string;
  order: number;
  title: string;
  summary: string;
  headline: string;
  liveUrl: string;
  liveLabel?: string;
  imageAlt: string;
};
type AiWork = { slug: string; order: number; headline: string; links: { label: string; href: string }[] };

const read = (file: string) => parseFrontmatter(readFileSync(file, "utf8"), file).data;
const home = read("content/site/home.md") as {
  headline: string;
  lines: string[];
  contact: { email: string; github: string };
  layers: Layer[];
  about: { title: string; quote: string };
};
const readDir = <T extends { order: number }>(dir: string) =>
  readdirSync(dir)
    .filter((f) => f.endsWith(".md"))
    .map((f) => read(`${dir}/${f}`) as T)
    .sort((a, b) => a.order - b.order);
const projects = readDir<Project>("content/site/projects");
const aiWorks = readDir<AiWork>("content/site/ai");

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

test.describe("모바일 메뉴", () => {
  // 헤더는 루트 레이아웃에 있어 페이지를 옮겨도 남는다. 열린 메뉴가 새 페이지를 가리지 않는지 본다.
  test.beforeEach(async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "mobile", "메뉴는 모바일 폭에서만 보인다");
    await page.goto("/");
    await page.waitForLoadState("networkidle");
  });

  // 화면만 바뀌는 이동이라 헤더의 메뉴는 그대로 남는다. 닫히고 새 페이지 제목이 보여야 한다.
  test("메뉴 링크로 이동하면 메뉴가 닫힌다", async ({ page }) => {
    const menu = page.locator("header details");
    await menu.locator("summary").click();
    await expect(menu).toHaveAttribute("open", "");
    await menu.getByRole("link", { name: "Work" }).click();
    await expect(page).toHaveURL(/\/work$/);
    await expect(menu).not.toHaveAttribute("open");
    await expect(page.getByRole("heading", { level: 1, name: "포트폴리오" })).toBeInViewport();
  });

  test("메뉴 밖을 누르거나 Esc를 누르면 닫힌다", async ({ page }) => {
    const menu = page.locator("header details");
    const summary = menu.locator("summary");

    await summary.click();
    await expect(menu).toHaveAttribute("open", "");
    await page.getByRole("heading", { level: 1 }).click();
    await expect(menu).not.toHaveAttribute("open");

    await summary.click();
    await expect(menu).toHaveAttribute("open", "");
    await page.keyboard.press("Escape");
    await expect(menu).not.toHaveAttribute("open");
    await expect(summary).toBeFocused();
  });
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

test.describe("기술 층 강조", () => {
  // 모든 서비스가 쓰지는 않는 층이라야 흐려지는 서비스가 생긴다.
  const layer = home.layers.find((l) => l.usedBy.length < projects.length)!;
  const used = (project: Project) => layer.usedBy.includes(project.slug);

  async function expectHighlight(page: Page, on: boolean) {
    const items = page.getByRole("list", { name: "운영 중인 서비스" }).getByRole("listitem");
    for (const [i, project] of projects.entries()) {
      await expect(items.nth(i)).toHaveCSS("opacity", on && !used(project) ? "0.3" : "1");
    }
  }

  test("층을 누르면 고정되고, 그 층을 쓰지 않는 서비스가 흐려진다", async ({ page }) => {
    await page.goto("/");
    const button = page.getByRole("button", { name: new RegExp(`^${layer.name}`) });
    await expect(button).toHaveAttribute("aria-pressed", "false");

    await button.click();
    await expect(button).toHaveAttribute("aria-pressed", "true");
    await expectHighlight(page, true);
    const names = projects.filter(used).map((p) => p.title).join(", ");
    await expect(page.getByText(`${layer.name} 층을 쓰는 서비스: ${names}`)).toBeAttached();

    await button.click();
    await expect(button).toHaveAttribute("aria-pressed", "false");
    await expectHighlight(page, false);
  });

  test("키보드로도 누를 수 있다", async ({ page }) => {
    await page.goto("/");
    const button = page.getByRole("button", { name: new RegExp(`^${layer.name}`) });
    await button.press("Enter");
    await expect(button).toHaveAttribute("aria-pressed", "true");
    await button.press("Space");
    await expect(button).toHaveAttribute("aria-pressed", "false");
  });

  test("마우스를 올리면 잠깐 보여 주고, 떼면 돌아간다", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name === "mobile", "터치 화면은 누르기만 쓴다");
    await page.goto("/");
    const button = page.getByRole("button", { name: new RegExp(`^${layer.name}`) });
    await button.hover();
    await expectHighlight(page, true);
    await expect(button).toHaveAttribute("aria-pressed", "false");
    await page.mouse.move(0, 0);
    await expectHighlight(page, false);
  });
});

test.describe("아래 섹션", () => {
  test("서비스 카드 세 장에 화면, 제목, 서비스 링크가 있고 첫 화면 목록이 카드를 가리킨다", async ({ page }) => {
    await page.goto("/");
    const section = page.getByRole("region", { name: "운영 중인 서비스" });
    const cards = section.getByRole("article");
    await expect(cards).toHaveCount(projects.length);
    for (const [i, project] of projects.entries()) {
      const card = cards.nth(i);
      await expect(card).toHaveAttribute("id", project.slug);
      await expect(card.getByRole("img", { name: project.imageAlt })).toBeVisible();
      await expect(card.getByRole("heading", { level: 3 })).toHaveText(project.headline);
      const live = card.getByRole("link", { name: new RegExp(project.liveLabel ?? "서비스 열기") });
      await expect(live).toHaveAttribute("href", project.liveUrl);
      await expect(card.getByRole("link", { name: "자세히 보기" })).toHaveAttribute("href", `/work#${project.slug}`);
    }
    await expect(section.getByRole("link", { name: /포트폴리오 전체 보기/ })).toHaveAttribute("href", "/work");

    // 첫 화면 목록의 이름을 누르면 해당 카드로 내려간다
    const first = projects[0];
    await page.getByRole("list", { name: "운영 중인 서비스" }).getByRole("link", { name: first.title, exact: true }).click();
    await expect(page).toHaveURL(new RegExp(`#${first.slug}$`));
    await expect(cards.first()).toBeInViewport();
  });

  test("AI 카드 네 장에 제목과 링크가 있고, 저장소에서 센 숫자가 채워져 있다", async ({ page }) => {
    await page.goto("/");
    const section = page.getByRole("region", { name: "AI로 일하는 방식" });
    const cards = section.getByRole("article");
    await expect(cards).toHaveCount(aiWorks.length);
    for (const [i, work] of aiWorks.entries()) {
      const card = cards.nth(i);
      await expect(card.getByRole("heading", { level: 3 })).toHaveText(work.headline);
      for (const link of work.links) {
        await expect(card.getByRole("link", { name: new RegExp(link.label) })).toHaveAttribute("href", link.href);
      }
      await expect(card.getByRole("link", { name: "자세히 보기" })).toHaveAttribute("href", `/ai/${work.slug}`);
    }
    // {adrCount} 같은 자리가 그대로 남지 않았는지
    await expect(section).not.toContainText("{");
    await expect(section).toContainText(/ADR \d+개/);
  });

  test("About에 소개, 동료 평가, 이력서와 연락 링크가 있다", async ({ page }) => {
    await page.goto("/");
    const section = page.getByRole("region", { name: home.about.title });
    await expect(section.getByText(home.about.quote)).toBeVisible();
    await expect(section.getByRole("link", { name: "이력서 보기" })).toHaveAttribute("href", "/resume");
    await expect(section.getByRole("link", { name: home.contact.email })).toHaveAttribute("href", `mailto:${home.contact.email}`);
    await expect(section.getByRole("link", { name: /GitHub/ })).toHaveAttribute("href", home.contact.github);
  });

  test("이미지마다 대체 텍스트가 있다", async ({ page }) => {
    await page.goto("/");
    const missing = await page.locator("main img").evaluateAll((imgs) => imgs.filter((img) => !img.getAttribute("alt")).length);
    expect(missing).toBe(0);
  });
});

test("캡처를 남긴다 (라이트, 다크)", async ({ page }, testInfo) => {
  for (const scheme of ["light", "dark"] as const) {
    await page.emulateMedia({ colorScheme: scheme });
    await page.goto("/");
    await page.screenshot({ path: testInfo.outputPath(`home-${scheme}.png`), fullPage: true });
  }
});
