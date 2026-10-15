import { readFileSync } from "node:fs";
import { expect, test } from "@playwright/test";
import { parseFrontmatter } from "../src/lib/frontmatter.mjs";
import { splitResume } from "../src/lib/resume.mjs";
import { collectErrors } from "./helpers";

// 이력서 화면 확인 (ADR-0008, docs/02-ia.md /resume). 캡처는 test-results/에만 남고 커밋하지 않는다.
// 기대값은 resume-page.md와 동기화한 이력서에서 읽는다.

type ResumePage = { title: string; label: string; print: string; sections: { id: string; title: string }[] };

const resumePage = parseFrontmatter(readFileSync("content/site/resume-page.md", "utf8"), "resume-page.md").data as ResumePage;
const resume = splitResume(readFileSync("content/synced/resume.md", "utf8"));
const home = parseFrontmatter(readFileSync("content/site/home.md", "utf8"), "home.md").data as {
  about: { title: string };
};

test("이력서가 열리고 콘솔 오류와 실패한 요청이 없다", async ({ page }) => {
  const errors = collectErrors(page);
  const response = await page.goto("/resume");
  expect(response?.status()).toBe(200);
  await page.waitForLoadState("networkidle");
  expect(errors).toEqual([]);
});

test("브라우저 제목과 이름(h1), 한 줄 소개가 있다", async ({ page }) => {
  await page.goto("/resume");
  await expect(page).toHaveTitle(`${resumePage.title} · 소재희`);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(resume.name);
  await expect(page.getByText(resume.tagline, { exact: true })).toBeVisible();
});

test("가로 스크롤이 생기지 않는다", async ({ page }) => {
  await page.goto("/resume");
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(0);
});

test("목차 열 개가 해당 절로 간다", async ({ page }) => {
  await page.goto("/resume");
  const nav = page.getByRole("navigation", { name: "이력서 목차" });
  await expect(nav.getByRole("link")).toHaveCount(resumePage.sections.length);
  for (const section of resumePage.sections) {
    await nav.getByRole("link", { name: section.title }).click();
    await expect(page).toHaveURL(new RegExp(`#${section.id}$`));
    const heading = page.getByRole("heading", { level: 2, name: section.title, exact: true });
    await expect(heading).toHaveAttribute("id", section.id);
    await expect(heading).toBeInViewport();
  }
});

test("홈 About의 이력서 보기로 오면 이력서가 열린다", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("region", { name: home.about.title }).getByRole("link", { name: "이력서 보기" }).click();
  await expect(page).toHaveURL(/\/resume$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(resume.name);
});

test("원문의 줄바꿈이 살아 있다 (강점 다섯 줄)", async ({ page }) => {
  await page.goto("/resume");
  const strengths = page.locator(".md-resume p", { hasText: "완성 지향" });
  await expect(strengths.locator("br")).toHaveCount(4);
});

test("전화번호 형식의 글자가 없다", async ({ page }) => {
  await page.goto("/resume");
  const text = await page.locator("body").innerText();
  expect(text).not.toMatch(/01[016789][-.\s]?\d{3,4}[-.\s]?\d{4}/);
});

test("인쇄 버튼은 브라우저 인쇄 창을 연다", async ({ page }) => {
  await page.goto("/resume");
  await page.evaluate(() => {
    (window as unknown as { printed: number }).printed = 0;
    window.print = () => {
      (window as unknown as { printed: number }).printed += 1;
    };
  });
  await page.getByRole("button", { name: resumePage.print }).click();
  expect(await page.evaluate(() => (window as unknown as { printed: number }).printed)).toBe(1);
});

test("인쇄하면 화면용 요소가 빠지고 다크 모드여도 흰 바탕에 검은 글자다", async ({ page }) => {
  await page.goto("/resume");
  await page.emulateMedia({ media: "print", colorScheme: "dark" });
  await expect(page.locator("body > header")).toBeHidden();
  await expect(page.locator("body > footer")).toBeHidden();
  await expect(page.getByRole("navigation", { name: "이력서 목차" })).toBeHidden();
  await expect(page.getByRole("button", { name: resumePage.print })).toBeHidden();
  await expect(page.getByText(resumePage.label, { exact: true })).toBeHidden();
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

  const colors = await page.evaluate(() => ({
    background: getComputedStyle(document.documentElement).backgroundColor,
    text: getComputedStyle(document.querySelector(".md-resume p")!).color,
  }));
  expect(colors).toEqual({ background: "rgb(255, 255, 255)", text: "rgb(17, 17, 17)" });
});

test("캡처를 남긴다 (라이트, 다크, 인쇄)", async ({ page }, testInfo) => {
  for (const scheme of ["light", "dark"] as const) {
    await page.emulateMedia({ colorScheme: scheme });
    await page.goto("/resume");
    await page.screenshot({ path: testInfo.outputPath(`resume-${scheme}.png`), fullPage: true });
  }
  await page.emulateMedia({ media: "print", colorScheme: "light" });
  await page.screenshot({ path: testInfo.outputPath("resume-print.png"), fullPage: true });
});
