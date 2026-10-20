import { readFileSync } from "node:fs";
import { expect, test, type Page } from "@playwright/test";
import { parseFrontmatter } from "../src/lib/frontmatter.mjs";

// 검색과 공유 (docs/guide/SEO_검색과_공유_정책_20261017.md). 화면 폭과 관계없는 값이라 데스크톱에서만 돌린다.
// 공유 정보는 운영 주소(https://jakeso.dev)를 가리키므로, 그림은 주소의 경로만 떼어 이 서버에서 받아 본다.

const SITE = "https://jakeso.dev";
const PAGES = ["/", "/work", "/ai", "/ai/case", "/resume"];
const home = parseFrontmatter(readFileSync("content/site/home.md", "utf8"), "home.md").data as {
  lines: string[];
  contact: { github: string };
};

const meta = (page: Page, attr: "property" | "name", key: string) =>
  page.locator(`meta[${attr}="${key}"]`).getAttribute("content");

// 모바일 프로젝트만 hasTouch가 켜져 있다 (playwright.config.ts).
test.skip(({ hasTouch }) => hasTouch, "화면 폭과 관계없는 값이다");

for (const path of PAGES) {
  test(`${path}는 제목, 설명, 대표 주소, 공유 그림을 알린다`, async ({ page, request }) => {
    await page.goto(path);
    const url = path === "/" ? SITE : `${SITE}${path}`;
    const title = await page.title();
    const description = await meta(page, "name", "description");
    expect(description).toBeTruthy();

    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", url);
    expect(await meta(page, "property", "og:url")).toBe(url);
    expect(await meta(page, "property", "og:title")).toBe(title);
    expect(await meta(page, "property", "og:description")).toBe(description);
    expect(await meta(page, "property", "og:site_name")).toBe("소재희");
    expect(await meta(page, "property", "og:locale")).toBe("ko_KR");
    expect(await meta(page, "name", "twitter:card")).toBe("summary_large_image");

    // 모든 페이지가 같은 그림 한 장을 쓴다. 하위 페이지의 openGraph가 그림을 덮어 홈에만 붙은 적이 있다.
    const image = await meta(page, "property", "og:image");
    expect(image).toMatch(new RegExp(`^${SITE}/_next/static/media/og-image\\.[^/]+\\.png$`));
    expect(await meta(page, "property", "og:image:width")).toBe("1200");
    expect(await meta(page, "property", "og:image:height")).toBe("630");
    expect(await meta(page, "name", "twitter:image")).toBe(image);
    const res = await request.get(new URL(image!).pathname);
    expect(res.status()).toBe(200);
    expect(res.headers()["content-type"]).toBe("image/png");
  });
}

test("홈은 네이버 서치어드바이저 소유 확인 태그를 단다", async ({ page }) => {
  await page.goto("/");
  expect(await meta(page, "name", "naver-site-verification")).toBe("f8c2cba6fbf38fea24228495b83acfd15ea2969e");
});

test("robots.txt는 모두 허용하고 사이트맵을 알린다", async ({ request }) => {
  const res = await request.get("/robots.txt");
  expect(res.status()).toBe(200);
  const body = await res.text();
  expect(body).toMatch(/^User-Agent: \*$/m);
  expect(body).toMatch(/^Allow: \/$/m);
  expect(body).not.toMatch(/^Disallow:/m);
  expect(body).toContain(`Sitemap: ${SITE}/sitemap.xml`);
});

test("사이트맵에 모든 페이지가 대표 주소 그대로 있다", async ({ request }) => {
  const res = await request.get("/sitemap.xml");
  expect(res.status()).toBe(200);
  const locs = [...(await res.text()).matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  expect(locs).toEqual(PAGES.map((path) => (path === "/" ? SITE : `${SITE}${path}`)));
});

test("홈은 화면에 보이는 사실로 한 사람의 페이지임을 알린다(JSON-LD)", async ({ page }) => {
  await page.goto("/");
  const scripts = page.locator('script[type="application/ld+json"]');
  await expect(scripts).toHaveCount(1);
  const data = JSON.parse((await scripts.textContent()) ?? "");
  expect(data["@type"]).toBe("ProfilePage");
  expect(data.url).toBe(SITE);
  const person = data.mainEntity;
  expect(person["@type"]).toBe("Person");
  expect(person.name).toBe("소재희");
  expect(person.alternateName).toBe("Jake");
  expect(person.url).toBe(SITE);
  expect(person.sameAs).toEqual([home.contact.github]);
  expect(person.description).toBe(home.lines[0]);
  expect(person.image).toMatch(new RegExp(`^${SITE}/_next/static/media/jake-avatar\\.[^/]+\\.png$`));
  // 화면에 보이는 값과 같은지: 머리의 별칭, 연락의 GitHub, 첫 화면 둘째 줄
  await expect(page.getByRole("banner").getByText("Jake", { exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "GitHub" }).first()).toHaveAttribute("href", home.contact.github);
  await expect(page.getByText(home.lines[0], { exact: true })).toBeVisible();
});

test("다른 페이지에는 JSON-LD가 없다", async ({ page }) => {
  for (const path of PAGES.filter((p) => p !== "/")) {
    await page.goto(path);
    await expect(page.locator('script[type="application/ld+json"]')).toHaveCount(0);
  }
});
