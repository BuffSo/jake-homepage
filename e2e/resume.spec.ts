import { readFileSync } from "node:fs";
import { expect, test, type Locator } from "@playwright/test";
import { parseFrontmatter } from "../src/lib/frontmatter.mjs";
import { splitResume } from "../src/lib/resume.mjs";
import { capturePath, collectErrors } from "./helpers";

// 이력서 화면 확인 (ADR-0008, docs/02-ia.md /resume). 캡처는 test-results/에만 남고 커밋하지 않는다.
// 기대값은 resume-page.md와 동기화한 이력서에서 읽는다.

type ResumePage = {
  title: string;
  label: string;
  print: string;
  endPhotoAlt: string;
  sections: { id: string; title: string }[];
};

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

test("머리는 화면에서 한 줄 소개를, 인쇄에서는 이름을 더 크게 그린다", async ({ page }) => {
  // docs/03-design.md F4 머리(2026-10-28). 화면은 이 페이지가 처음 전하는 말에 크기를 두고, 종이에는 사이트 헤더가 없어 이름을 크게 둔다.
  await page.goto("/resume");
  const size = (l: Locator) => l.evaluate((el) => parseFloat(getComputedStyle(el).fontSize));
  const name = page.getByRole("heading", { level: 1 });
  const tagline = page.getByText(resume.tagline, { exact: true });
  expect(await size(tagline)).toBeGreaterThan(await size(name));
  await page.emulateMedia({ media: "print" });
  expect(await size(name)).toBeGreaterThan(await size(tagline));
});

test("가로 스크롤이 생기지 않는다", async ({ page }) => {
  await page.goto("/resume");
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(0);
});

test("연락처와 학력 표는 좁은 화면에서 행마다 상자로, 넓은 화면과 인쇄에서는 표로 보인다", async ({ page }, testInfo) => {
  // docs/guide/UI_모바일_표_20261017.md. 이력서의 표는 연락처, 학력, 수상 순서로 셋이다.
  await page.goto("/resume");
  const tables = page.locator(".md-resume .md-table");
  await expect(tables).toHaveCount(3);
  const [contact, education, awards] = [0, 1, 2].map((i) => tables.nth(i));
  const stacked: [Locator, string[]][] = [
    [contact, ["이메일", "GitHub", "홈페이지"]],
    [education, ["기간", "학교", "전공", "졸업논문"]],
  ];
  const display = (box: Locator) => box.locator("table").evaluate((t) => getComputedStyle(t).display);

  if (testInfo.project.name === "mobile") {
    // 상자 안에서 옆으로 넘기지 않고, 칸마다 열 머리글 이름표가 보인다
    for (const [box, labels] of stacked) {
      expect(await box.evaluate((el) => el.scrollWidth - el.clientWidth)).toBeLessThanOrEqual(0);
      expect(await display(box)).toBe("block");
      for (const label of labels) await expect(box.locator(".md-label", { hasText: label }).first()).toBeVisible();
    }
  } else {
    for (const [box] of stacked) {
      expect(await display(box)).toBe("table");
      await expect(box.locator(".md-label").first()).toBeHidden();
    }
  }
  // 수상은 여러 행에 세 칸이라 어느 폭에서나 표이고 이름표가 없다
  expect(await display(awards)).toBe("table");
  await expect(awards.locator(".md-label")).toHaveCount(0);

  // 표 구조는 접근성 트리에 남고, 칸 이름에 이름표 글자가 섞이지 않는다(이름표는 aria-hidden)
  await expect(page.getByRole("table")).toHaveCount(3);
  await expect(page.getByRole("cell", { name: /^\S+@\S+$/ })).toHaveCount(1);

  // 인쇄는 화면 폭과 관계없이 표다
  await page.emulateMedia({ media: "print" });
  for (const [box] of stacked) {
    expect(await display(box)).toBe("table");
    await expect(box.locator(".md-label").first()).toBeHidden();
  }
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

test("자기소개의 핵심 역량은 이름표 바로 아래 목록으로 보인다", async ({ page }) => {
  // 원문에서 이름표 뒤 빈 줄 다음의 불릿 줄을 센다
  const bullets = resume.body.match(/^\*\*\[핵심 역량\]\*\*\n\n((?:- .*\n)+)/m)![1].trim().split("\n");
  await page.goto("/resume");
  const label = page.locator(".md-resume p", { hasText: "[핵심 역량]" });
  await expect(label.locator("xpath=following-sibling::*[1]")).toHaveJSProperty("tagName", "UL");
  await expect(label.locator("xpath=following-sibling::ul[1]/li")).toHaveCount(bullets.length);
});

test("업무 경험의 묶음 제목은 바로 아래 목록에 붙는다", async ({ page }) => {
  await page.goto("/resume");
  const titles = await page.locator(".md-resume .md-group").evaluateAll((els) =>
    els.map((el) => ({
      next: el.nextElementSibling?.tagName,
      above: parseFloat(getComputedStyle(el).marginTop),
      below: parseFloat(getComputedStyle(el).marginBottom),
    })),
  );
  expect(titles.length).toBeGreaterThan(0);
  for (const title of titles) {
    expect(["UL", "OL"]).toContain(title.next);
    expect(title.below).toBeLessThan(title.above);
  }
});

test("동료 평가(Peer Review)는 다른 인용과 구분되는 상자로 보인다", async ({ page }) => {
  await page.goto("/resume");
  const boxes = page.locator(".md-resume .md-review");
  // 원문의 Peer Review 머리글마다 상자가 하나씩 있다
  await expect(boxes).toHaveCount(resume.body.match(/^\*\*Peer Review\*\*$/gm)!.length);
  const style = (locator: typeof boxes) =>
    locator.evaluate((el) => ({ background: getComputedStyle(el).backgroundColor, line: getComputedStyle(el).borderLeftColor }));
  const box = await style(boxes.first());
  const accent = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue("--accent").trim());
  expect(box.background).not.toBe("rgba(0, 0, 0, 0)");
  expect(box.line).toBe(`rgb(${accent.match(/\w\w/g)!.map((h) => parseInt(h, 16)).join(", ")})`);
  // 프로젝트 소개 인용은 상자 밖에 그대로 있다
  const plain = page.locator(".md-resume blockquote:not(.md-review blockquote)").first();
  expect((await style(plain)).line).not.toBe(box.line);
});

test("본문 끝, 푸터 위에 사진 한 장이 있고 인쇄에서는 빠진다", async ({ page }) => {
  await page.goto("/resume");
  const photo = page.getByRole("img", { name: resumePage.endPhotoAlt });
  await photo.scrollIntoViewIfNeeded();
  await expect(photo).toBeVisible();
  await expect.poll(() => photo.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBe(true);

  const box = (await photo.boundingBox())!;
  const body = (await page.locator(".md-resume").boundingBox())!;
  const footer = (await page.locator("body > footer").boundingBox())!;
  expect(box.y).toBeGreaterThanOrEqual(body.y + body.height);
  expect(box.y + box.height).toBeLessThanOrEqual(footer.y);
  // 원본이 960px라 레티나에서도 선명한 30rem까지만 넓히고, 16:9로 자른다
  expect(box.width).toBeLessThanOrEqual(480);
  expect(box.width / box.height).toBeCloseTo(16 / 9, 1);

  await page.emulateMedia({ media: "print" });
  await expect(photo).toBeHidden();
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
  // 동료 평가 상자는 인쇄에서 바탕 없이 선만 남는다
  expect(await page.locator(".md-review").first().evaluate((el) => getComputedStyle(el).backgroundColor)).toBe("rgba(0, 0, 0, 0)");

  const colors = await page.evaluate(() => ({
    background: getComputedStyle(document.documentElement).backgroundColor,
    text: getComputedStyle(document.querySelector(".md-resume p")!).color,
  }));
  expect(colors).toEqual({ background: "rgb(255, 255, 255)", text: "rgb(17, 17, 17)" });
});

test("캡처를 남긴다 (라이트, 다크, 인쇄)", async ({ page }) => {
  for (const scheme of ["light", "dark"] as const) {
    await page.emulateMedia({ colorScheme: scheme });
    await page.goto("/resume");
    await page.screenshot({ path: capturePath(page, `resume-${scheme}`), fullPage: true });
  }
  await page.emulateMedia({ media: "print", colorScheme: "light" });
  await page.screenshot({ path: capturePath(page, "resume-print"), fullPage: true });
});
