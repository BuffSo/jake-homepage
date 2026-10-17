import { readdirSync, readFileSync } from "node:fs";
import { expect, test, type Page } from "@playwright/test";
import { parseFrontmatter } from "../src/lib/frontmatter.mjs";
import { capturePath, collectErrors } from "./helpers";

// 홈 화면 확인 (ADR-0008). 캡처는 test-results/에만 남고 커밋하지 않는다.
// 기대값은 사이트 전용 글(content/site/)에서 읽는다. 문구를 고쳐도 테스트는 그대로 두고, 화면에 빠진 것만 잡는다.

type Layer = { name: string; items: { name: string; usedBy: string[] }[] };
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
type AiWork = {
  slug: string;
  order: number;
  home?: number;
  headline: string;
  links: { label: string; href: string; home?: boolean }[];
};

const read = (file: string) => parseFrontmatter(readFileSync(file, "utf8"), file).data;
const home = read("content/site/home.md") as {
  headline: string;
  lines: string[];
  contact: { email: string; github: string };
  layers: Layer[];
  about: { title: string; reviewsTitle: string; reviews: { quote: string; by: string; href: string }[] };
};
const readDir = <T extends { order: number }>(dir: string) =>
  readdirSync(dir)
    .filter((f) => f.endsWith(".md"))
    .map((f) => read(`${dir}/${f}`) as T)
    .sort((a, b) => a.order - b.order);
const projects = readDir<Project>("content/site/projects");
// 홈에는 home 순서가 있는 네 장만 싣는다. 나머지는 /ai에만 있다.
const aiWorks = readDir<AiWork>("content/site/ai")
  .filter((w) => w.home !== undefined)
  .sort((a, b) => a.home! - b.home!);

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

test("헤더 왼쪽의 프로필 그림과 별칭 Jake가 실명 대신 홈 링크다", async ({ page }) => {
  for (const path of ["/", "/work", "/ai", "/resume"]) {
    await page.goto(path);
    const header = page.locator("body > header");
    const homeLink = header.getByRole("link", { name: "Jake", exact: true });
    await expect(homeLink).toHaveAttribute("href", "/");
    // 그림은 장식이라 대체 텍스트가 비어 있고, 불러와져 보인다.
    const avatar = homeLink.locator("img");
    await expect(avatar).toHaveAttribute("alt", "");
    await expect(avatar).toBeVisible();
    await expect.poll(() => avatar.evaluate((img: HTMLImageElement) => img.naturalWidth)).toBeGreaterThan(0);
    await expect(header).not.toContainText("소재희");
  }
});

test("탭 아이콘(favicon.ico, icon.png)과 홈 화면 아이콘(apple-icon.png)이 있다", async ({ page, request }) => {
  await page.goto("/");
  const icons = [
    { rel: "icon", sizes: "48x48", type: "image/x-icon" },
    { rel: "icon", sizes: "192x192", type: "image/png" },
    { rel: "apple-touch-icon", sizes: "180x180", type: "image/png" },
  ];
  for (const { rel, sizes, type } of icons) {
    const href = await page.locator(`head link[rel="${rel}"][sizes="${sizes}"]`).getAttribute("href");
    const response = await request.get(href!);
    expect(response.status()).toBe(200);
    expect(response.headers()["content-type"]).toContain(type);
  }

  // 탭 아이콘은 16, 32, 48 세 크기를 한 파일에 담는다
  const ico = await (await request.get("/favicon.ico")).body();
  const count = ico.readUInt16LE(4);
  const sizes = Array.from({ length: count }, (_, i) => ico[6 + 16 * i]).sort((a, b) => a - b);
  expect(sizes).toEqual([16, 32, 48]);
});

test("헤더에서 Work, AI, Resume로 갈 수 있다", async ({ page }, testInfo) => {
  await page.goto("/");
  if (testInfo.project.name === "mobile") await page.getByText("메뉴").click();
  const nav = page.getByRole("navigation", { name: "주요 메뉴" }).locator("visible=true");
  await expect(nav.getByRole("link", { name: "Work" })).toHaveAttribute("href", "/work");
  await expect(nav.getByRole("link", { name: "AI" })).toHaveAttribute("href", "/ai");
  await expect(nav.getByRole("link", { name: "Resume" })).toHaveAttribute("href", "/resume");
});

test("헤더에 지금 보는 페이지가 표시된다", async ({ page }, testInfo) => {
  const mobile = testInfo.project.name === "mobile";
  const nav = page.getByRole("navigation", { name: "주요 메뉴" }).locator("visible=true");
  const open = async () => {
    if (mobile) await page.getByText("메뉴", { exact: true }).click();
  };
  for (const [path, label] of [
    ["/work", "Work"],
    ["/ai", "AI"],
    ["/resume", "Resume"],
  ]) {
    await page.goto(path);
    await open();
    for (const other of ["Work", "AI", "Resume"]) {
      const link = nav.getByRole("link", { name: other });
      if (other === label) {
        await expect(link).toHaveAttribute("aria-current", "page");
        await expect(link).toHaveCSS("text-decoration-line", "underline");
      } else {
        await expect(link).not.toHaveAttribute("aria-current");
      }
    }
  }
  await page.goto("/");
  await open();
  await expect(nav.locator("[aria-current]")).toHaveCount(0);
});

test("화면만 바뀌는 이동 뒤에도 헤더의 표시가 따라온다", async ({ page }, testInfo) => {
  // 헤더는 루트 레이아웃이라 다시 그려지지 않는다. 경로가 바뀌면 표시도 옮겨 가야 한다.
  // 모바일은 메뉴 링크를 누르면 메뉴가 닫히므로, 이동 뒤에 메뉴를 다시 열어 본다.
  const open = async () => {
    if (testInfo.project.name === "mobile") await page.getByText("메뉴", { exact: true }).click();
  };
  await page.goto("/work");
  const nav = page.getByRole("navigation", { name: "주요 메뉴" }).locator("visible=true");
  await open();
  await nav.getByRole("link", { name: "AI" }).click();
  await expect(page).toHaveURL(/\/ai$/);
  await open();
  await expect(nav.getByRole("link", { name: "AI" })).toHaveAttribute("aria-current", "page");
  await expect(nav.getByRole("link", { name: "Work" })).not.toHaveAttribute("aria-current");
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
      await expect(buttons.nth(i)).toContainText(layer.items.map((item) => item.name).join(" · "));
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
  // 서비스마다 그 층에서 쓴 기술 (content/site/home.md의 items[].usedBy)
  const techs = (layer: Layer, project: Project) =>
    layer.items.filter((item) => item.usedBy.includes(project.slug)).map((item) => item.name);
  // 서비스마다 쓴 기술이 모두 다른 층(지금은 워커). 강조가 서비스별로 맞게 갈리는지 보기 좋다.
  const layer = home.layers.find((l) => new Set(projects.map((p) => techs(l, p).join())).size === projects.length)!;
  // 그 층의 기술을 하나도 안 쓰는 서비스가 있어야 흐려지는 서비스가 생긴다. 지금 데이터에는 없다.
  const dimLayer = home.layers.find((l) => projects.some((p) => techs(l, p).length === 0));
  const serviceItems = (page: Page) => page.getByRole("list", { name: "운영 중인 서비스" }).getByRole("listitem");

  async function expectHighlight(page: Page, target: Layer | null) {
    for (const [i, project] of projects.entries()) {
      const item = serviceItems(page).nth(i);
      const used = target ? techs(target, project) : [];
      await expect(item).toHaveCSS("opacity", target && used.length === 0 ? "0.3" : "1");
      // 층마다의 기술 줄은 자리만 잡는 보이지 않는 사본이 있으므로 보이는 것만 센다.
      if (used.length) await expect(item.getByText(used.join(" · "), { exact: true }).filter({ visible: true })).toHaveCount(1);
      // 쓴 기술이 보이는 동안 설명은 자리만 남고, 그 밖에는 설명이 보인다.
      if (used.length) await expect(item.getByText(project.summary)).toBeHidden();
      else await expect(item.getByText(project.summary)).toBeVisible();
    }
  }

  test("층을 누르면 고정되고, 서비스마다 그 층에서 쓴 기술이 보인다", async ({ page }) => {
    await page.goto("/");
    const button = page.getByRole("button", { name: new RegExp(`^${layer.name}`) });
    const band = page.getByRole("list", { name: "운영 중인 서비스" });
    const before = (await band.boundingBox())!.height;
    await expect(button).toHaveAttribute("aria-pressed", "false");

    await button.click();
    await expect(button).toHaveAttribute("aria-pressed", "true");
    await expectHighlight(page, layer);
    // 설명 자리에 겹쳐 보이므로 목록 높이가 바뀌지 않는다.
    expect((await band.boundingBox())!.height).toBe(before);
    const announced = projects
      .map((p) => `${p.title} ${techs(layer, p).length ? techs(layer, p).join(", ") : "쓰지 않음"}`)
      .join(" / ");
    await expect(page.getByText(`${layer.name} 층: ${announced}`)).toBeAttached();

    await button.click();
    await expect(button).toHaveAttribute("aria-pressed", "false");
    await expectHighlight(page, null);
  });

  test("여섯 층 모두 서비스마다 그 층에서 쓴 기술이 보이고, 목록 높이가 바뀌지 않는다", async ({ page }) => {
    await page.goto("/");
    const band = page.getByRole("list", { name: "운영 중인 서비스" });
    const before = (await band.boundingBox())!.height;
    for (const target of home.layers) {
      const button = page.getByRole("button", { name: new RegExp(`^${target.name}`) });
      await button.click();
      await expectHighlight(page, target);
      expect((await band.boundingBox())!.height, target.name).toBe(before);
      await button.click();
    }
  });

  test("1024 폭에서 기술 줄이 두 줄이 되어도 목록 높이가 바뀌지 않는다", async ({ page }, testInfo) => {
    // 서비스 칸이 가장 좁은 데스크톱 폭이다. 층마다의 기술 줄을 보이지 않게 겹쳐 자리를 미리 잡아 둔다(service-list.tsx).
    test.skip(testInfo.project.name === "mobile", "데스크톱 폭 확인");
    await page.setViewportSize({ width: 1024, height: 800 });
    await page.goto("/");
    const band = page.getByRole("list", { name: "운영 중인 서비스" });
    const before = (await band.boundingBox())!.height;
    for (const target of home.layers) {
      const button = page.getByRole("button", { name: new RegExp(`^${target.name}`) });
      await button.click();
      expect((await band.boundingBox())!.height, target.name).toBe(before);
      for (const [i] of projects.entries()) {
        const item = serviceItems(page).nth(i);
        const shown = item.locator("p:not([aria-hidden])").last();
        const domain = (await item.getByRole("link").last().boundingBox())!;
        const box = (await shown.boundingBox())!;
        expect(box.y + box.height, `${target.name} · ${projects[i].title}`).toBeLessThanOrEqual(domain.y + 0.5);
      }
      await button.click();
    }
  });

  test("하나도 안 쓴 서비스만 흐려진다", async ({ page }) => {
    test.skip(!dimLayer, "지금 층 데이터에는 기술을 하나도 안 쓰는 서비스가 있는 층이 없다");
    await page.goto("/");
    await page.getByRole("button", { name: new RegExp(`^${dimLayer!.name}`) }).click();
    await expectHighlight(page, dimLayer!);
  });

  test("층 안의 기술마다 쓴 서비스가 달라도, 하나라도 쓴 서비스는 흐려지지 않는다", async ({ page }) => {
    // API 층은 TypeScript를 세 서비스가 모두 쓴다. 층 하나로 묶었을 때 GENYS Lotto AI가 흐려졌던 일을 막는다.
    const api = home.layers.find((l) => l.name === "API")!;
    await page.goto("/");
    await page.getByRole("button", { name: /^API/ }).click();
    await expectHighlight(page, api);
    for (const [i] of projects.entries()) await expect(serviceItems(page).nth(i)).toHaveAttribute("data-state", "hit");
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
    await expectHighlight(page, layer);
    await expect(button).toHaveAttribute("aria-pressed", "false");
    await page.mouse.move(0, 0);
    await expectHighlight(page, null);
  });
});

test.describe("첫 화면 아래 SCROLL 표시", () => {
  test("첫 화면 안에 보이고, 누르면 운영 중인 서비스로 내려간다", async ({ page }) => {
    await page.goto("/");
    const cue = page.getByRole("link", { name: /^SCROLL/ });
    await expect(cue).toBeInViewport();
    await cue.click();
    await expect(page).toHaveURL(/#work$/);
    await expect(page.getByRole("heading", { level: 2, name: "운영 중인 서비스" })).toBeInViewport();
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
      for (const link of work.links.filter((l) => l.home)) {
        await expect(card.getByRole("link", { name: new RegExp(link.label) })).toHaveAttribute("href", link.href);
      }
      await expect(card.getByRole("link", { name: "자세히 보기" })).toHaveAttribute("href", `/ai#${work.slug}`);
    }
    // {adrCount} 같은 자리가 그대로 남지 않았는지
    await expect(section).not.toContainText("{");
    await expect(section).toContainText(/ADR \d+개/);
  });

  test("About에 소개, 동료 평가, 이력서와 연락 링크가 있다", async ({ page }) => {
    await page.goto("/");
    const section = page.getByRole("region", { name: home.about.title });
    for (const review of home.about.reviews) await expect(section.getByText(`“${review.quote}”`)).toBeVisible();
    await expect(section.getByRole("link", { name: "이력서 보기" })).toHaveAttribute("href", "/resume");
    await expect(section.getByRole("link", { name: home.contact.email })).toHaveAttribute("href", `mailto:${home.contact.email}`);
    await expect(section.getByRole("link", { name: /GitHub/ })).toHaveAttribute("href", home.contact.github);
  });

  test("동료 평가 세 줄의 출처를 누르면 이력서에서 그 문장이 든 Peer Review 상자로 간다", async ({ page }) => {
    for (const review of home.about.reviews) {
      await page.goto("/");
      const section = page.getByRole("region", { name: home.about.title });
      await expect(section.getByRole("heading", { name: home.about.reviewsTitle })).toBeVisible();
      await section.getByRole("link", { name: `${review.by} 동료 평가 원문` }).click();
      await expect(page).toHaveURL(new RegExp(`${review.href}$`));
      const box = page.locator(review.href.slice(review.href.indexOf("#")));
      await expect(box).toHaveClass("md-review");
      await expect(box.locator("> p")).toHaveText("Peer Review");
      await expect(box.locator("blockquote")).toContainText(review.quote.replace(/ …$/, ""));
      // 상자가 화면 맨 위 근처(절 제목과 같은 1rem 아래)에 멈춘다
      await expect.poll(async () => Math.round((await box.boundingBox())!.y)).toBe(16);
    }
  });

  test("이미지마다 대체 텍스트가 있다", async ({ page }) => {
    await page.goto("/");
    const missing = await page.locator("main img").evaluateAll((imgs) => imgs.filter((img) => !img.getAttribute("alt")).length);
    expect(missing).toBe(0);
  });
});

test("캡처를 남긴다 (라이트, 다크)", async ({ page }) => {
  for (const scheme of ["light", "dark"] as const) {
    await page.emulateMedia({ colorScheme: scheme });
    await page.goto("/");
    await page.screenshot({ path: capturePath(page, `home-${scheme}`), fullPage: true });
  }
});
