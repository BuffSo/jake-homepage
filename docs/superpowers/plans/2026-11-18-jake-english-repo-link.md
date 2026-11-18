# Jake English 페이지에 저장소 링크 넣기 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `/ai/jake-english`의 영상 아래(글 링크 「GitHub 저장소 ↗」)와 끝 버튼 줄(테두리 버튼 「저장소 ↗」)에서 jake-english 저장소로 가게 합니다.

**Architecture:** 저장소 주소와 맨 위 글은 사이트 전용 글의 `repo: { href, caption }`에 두고, 화살표와 끝 버튼 글은 영상처럼 화면 코드에 둡니다. 두 링크는 기존 `ExternalLink`와 `ButtonLink`로 그려 새 창 열기와 방문 통계가 지금 방식 그대로 붙습니다.

**Tech Stack:** Next.js 16 App Router, TypeScript, Tailwind CSS 4, Playwright

**Spec:** `docs/superpowers/specs/2026-11-18-jake-english-repo-link-design.md`

## Global Constraints

- 저장소 주소는 `https://github.com/BuffSo/jake-english`이고 `content/site/jake-english.md`에만 씁니다. 코드와 테스트는 글에서 읽습니다.
- 맨 위 글은 「GitHub 저장소」, 끝 버튼 글은 「저장소」입니다. 화살표 ↗는 화면 코드가 붙이고 `aria-hidden`입니다.
- 끝 버튼 순서: 「영상 보기」(solid) · 「저장소」(outline) · 「AI로 일하는 방식」(outline).
- 이야기 4컷 선까지의 간격은 지금과 같게(2.5rem, `lg` 3.5rem) 둡니다.
- 길이는 rem과 Tailwind 기본 유틸리티로 씁니다. px 임의값을 쓰지 않습니다(`npm run check:units`).
- 공개 글(주석, 문서, 커밋, PR, devlog)은 합니다체로, em dash와 en dash 없이 씁니다. 링크를 넣는 이유는 「앱의 코드와 기록을 바로 볼 수 있게」까지만 쓰고 독자를 특정하지 않습니다. 저장소 README 문장을 평가하지 않습니다. 로컬 절대 경로를 쓰지 않습니다.
- 커밋 메시지는 Conventional Commits 영어, 쌍따옴표 없이, AI 서명 줄 없이 씁니다. `--no-verify`를 쓰지 않습니다.
- 개발 서버는 `npx next dev -p 3301`입니다. E2E는 포트 3210입니다.

## Review Focus

- 320 화면: 끝 버튼 세 개가 두 줄로 꺾여도 가로 스크롤이 생기지 않아야 합니다. → 기존 "가로 스크롤이 생기지 않는다 (지금 폭과 320)"가 확인합니다.
- 두 링크의 이름이 겹침: 「저장소」로 찾으면 「GitHub 저장소」까지 잡힐 수 있습니다. 맨 위 링크는 하나만 잡혀야 합니다. → Task 1 맨 위 시험의 `toHaveCount(1)`
- 영상 블록 여백을 옮긴 뒤 간격: 저장소 링크 아래부터 이야기 4컷 선까지가 지금 영상 아래 여백과 같아야 합니다. → Task 1 맨 위 시험의 간격 확인
- 누를 자리: 글 링크가 작은 글이라 높이가 2.75rem보다 작아지면 모바일에서 누르기 어렵습니다. → Task 1 맨 위 시험의 높이 확인
- 다크 모드에서 `muted` 글이 바탕에 묻히지 않아야 합니다. → Task 2 다크 캡처로 눈으로 확인

---

### Task 1: 저장소 링크 두 곳

**Files:**
- Modify: `content/site/jake-english.md` (머리말 `video` 뒤에 `repo`, 아래 주석에 출처 한 줄)
- Modify: `src/lib/content.ts:191-200` (`JakeEnglish` 형)
- Modify: `src/app/ai/jake-english/page.tsx` (영상 블록, 끝 버튼 줄, 맨 위 주석의 순서 설명)
- Test: `e2e/ai-jake-english.spec.ts`

**Interfaces:**
- Produces: `JakeEnglish.repo: { href: string; caption: string }` (`src/lib/content.ts`), 글의 머리말 `repo.href`, `repo.caption`

- [ ] **Step 1: 실패하는 시험 쓰기**

`e2e/ai-jake-english.spec.ts`의 글 형에 `repo: { href: string; caption: string }`을 더하고, 영상 시험 뒤에 맨 위 시험을 더하고, 끝 링크 시험을 바꿉니다.

```ts
test("영상 아래에 GitHub 저장소 글 링크가 있고, 새 창으로 열리고, 이야기 4컷까지 간격은 그대로다", async ({ page }) => {
  await page.goto(PATH);
  const link = page.locator("main").getByRole("link", { name: je.repo.caption });
  await expect(link).toHaveCount(1);
  await expect(link).toHaveAttribute("href", je.repo.href);
  await expect(link).toHaveAttribute("target", "_blank");
  const box = (await link.boundingBox())!;
  expect(box.height).toBeGreaterThanOrEqual(44);
  // main의 링크 순서: 돌아가기, 영상, 저장소, ...
  const hrefs = await page.locator("main a").evaluateAll((els) => els.map((a) => a.getAttribute("href")));
  expect(hrefs.indexOf(je.repo.href)).toBe(hrefs.indexOf(je.video.href) + 1);
  const story = (await page.getByRole("region", { name: "이야기 4컷" }).boundingBox())!;
  const gap = page.viewportSize()!.width >= 1024 ? 56 : 40;
  expect(Math.abs(story.y - (box.y + box.height) - gap)).toBeLessThanOrEqual(1);
});

test("끝 링크는 영상 보기, 저장소, AI로 일하는 방식 순서이고 한 줄에 든다", async ({ page }) => {
  await page.goto(PATH);
  const end = page.locator("main > div").last().getByRole("link");
  await expect(end).toHaveText([/^영상 보기/, /^저장소/, /^AI로 일하는 방식$/]);
  await expect(end.nth(0)).toHaveAttribute("href", je.video.href);
  await expect(end.nth(1)).toHaveAttribute("href", je.repo.href);
  await expect(end.nth(0)).toHaveAttribute("target", "_blank");
  await expect(end.nth(1)).toHaveAttribute("target", "_blank");
  const tops = await end.evaluateAll((els) => els.map((a) => Math.round(a.getBoundingClientRect().top)));
  expect(new Set(tops).size).toBe(1);
  await expect(page.locator("main").getByRole("link", { name: "AI로 일하는 방식" })).toHaveCount(2);
  await end.nth(2).click();
  await expect(page).toHaveURL(/\/ai$/);
});
```

- [ ] **Step 2: 시험이 실패하는지 보기**

Run: `npx next build && npx playwright test e2e/ai-jake-english.spec.ts`
Expected: 새 두 시험만 FAIL(`je.repo`가 없어 `TypeError` 또는 링크 0개). 나머지는 PASS.

- [ ] **Step 3: 글과 형 더하기**

- `content/site/jake-english.md` 머리말 `video` 바로 뒤:
  ```yaml
  repo:
    href: https://github.com/BuffSo/jake-english
    caption: GitHub 저장소
  ```
- 아래 주석에 한 줄: repo는 영상 아래 둘째 줄의 글 링크와 끝 버튼 「저장소」가 같이 쓰는 주소이고, 공개 저장소를 2026-11-18에 열어 확인했다. 줄 끝 ↗와 끝 버튼 글 「저장소」(`/ai` 「이 사이트」의 저장소 버튼과 같은 말)는 화면에서 붙인다.
- `src/lib/content.ts`의 `JakeEnglish`에 `repo: { href: string; caption: string };`을 `video` 뒤에 더합니다.

- [ ] **Step 4: 화면 고치기** (`src/app/ai/jake-english/page.tsx`)

- 영상 `ExternalLink`의 `mb-10 lg:mb-14`를 떼고, 영상 링크와 새 저장소 링크를 `<div className="mb-10 lg:mb-14">`로 감쌉니다. 영상 링크의 나머지 클래스는 그대로입니다.
- 저장소 링크: `<ExternalLink href={je.repo.href} className="mt-1 flex min-h-11 w-fit items-center gap-1 text-sm text-muted hover:text-fg">{je.repo.caption}<span aria-hidden="true">↗</span></ExternalLink>`
- 끝 버튼 줄의 「영상 보기」와 「AI로 일하는 방식」 사이에 `<ButtonLink href={je.repo.href}>저장소</ButtonLink>`.
- 맨 위 주석의 순서 설명을 「머리 → 영상과 저장소 링크 → ... → 끝 링크」로 고칩니다.

- [ ] **Step 5: 시험이 통과하는지 보기**

Run: `npx next build && npx playwright test e2e/ai-jake-english.spec.ts`
Expected: 모두 PASS(데스크톱, 모바일).

- [ ] **Step 6: 커밋**

```bash
git add content/site/jake-english.md src/lib/content.ts src/app/ai/jake-english/page.tsx e2e/ai-jake-english.spec.ts
git commit -F - <<'EOF'
feat(app): link the Jake English repo from its page

Adds a text link under the video and an outline button in the end row,
so the app code and its specs, plans and PRs are one click away.
EOF
```

### Task 2: 문서와 캡처

**Files:**
- Create: `docs/design/ai-jake-english/repo-now-top-{1280,375}.png`, `repo-c-top-{1280,375}.png`, `repo-now-bottom-{1280,375}.png`, `repo-a-bottom-{1280,375}.png` (시안), `repo-top-{1280,375}{,-dark}.png`, `repo-bottom-{1280,375}{,-dark}.png` (구현 뒤)
- Modify: `docs/02-ia.md` (페이지 표의 `/ai/jake-english` 줄, `/ai/jake-english` 절의 구성 표, 영상과 끝 링크 항목, 새 저장소 링크 항목, 시안 절)
- Modify: `docs/03-design.md` (Jake English 페이지 표의 영상, 끝 링크 줄과 새 저장소 링크 줄)

- [ ] **Step 1: 시안 캡처 옮기기**: main 세션이 찍은 `now-top`, `now-bottom`, `a-bottom`, `c-top`(1280, 375, 2배)을 `sips --resampleWidth <폭>`으로 1배로 줄여 위 이름으로 둡니다. B는 비교판에만 있고 옮기지 않습니다(사용자가 고른 안과 지금 화면만 둠).
- [ ] **Step 2: 구현 뒤 캡처**: 3301 개발 서버에서 시안과 같은 자리(맨 위는 페이지 위부터 이야기 4컷 소제목 위 8px까지, 맨 아래는 끝 버튼 줄 위 220px부터 아래 72px까지)를 1배로 라이트와 다크에서 찍습니다. 스크립트는 scratchpad에 두고 커밋하지 않습니다. 찍기 전에 서버가 주는 CSS에 `w-fit`, `min-h-11`이 있는지 봅니다.
- [ ] **Step 3: 캡처를 눈으로 확인**: 맨 위 간격이 시안 C와 같고, 다크에서 글이 읽히고, 375에서 버튼 세 개가 한 줄인지 봅니다.
- [ ] **Step 4: IA와 디자인 문서 고치기**: 설계의 방법 표(A, B, C와 고른 이유, main 세션은 A를 추천했고 사용자가 C를 더함)와 정한 값을 옮기고, 시안 절에 시안과 구현 뒤 캡처 표를 더합니다. 페이지 전체 캡처 `page-*.png` 네 장(2026-11-11)은 다시 찍지 않습니다. 한 장이 1.5~2MB이고, 바뀐 두 곳은 `repo-*` 캡처가 보여 주기 때문입니다. IA에 그렇게 적습니다.
- [ ] **Step 5: 커밋**

```bash
git add docs/02-ia.md docs/03-design.md docs/design/ai-jake-english
git commit -F - <<'EOF'
docs: record the Jake English repo links in the IA and design docs
EOF
```

### Task 3: 검증, devlog, PR

- [ ] **Step 1**: `npm run verify`. Expected: 요약 표 모두 통과(로컬 전용 검사가 건너뛰어졌으면 밝힘). 실패하면 표와 실패 내용을 그대로 main 세션에 보고합니다.
- [ ] **Step 2**: `docs/devlog/2026-11-18-jake-english-repo-link.md`를 `docs/devlog/README.md` 양식으로 씁니다. 흐름 표에 「main 세션은 A 하나를 추천, 사용자가 C도 함께 넣자고 함」을 적습니다. 커밋 `docs(devlog): record the Jake English repo links`.
- [ ] **Step 3**: 브랜치를 푸시하고 `gh pr create`로 PR을 엽니다. 제목 `feat(app): link the Jake English repo from its page`, 본문은 한국어 합니다체로 요약, 배경, 한계(맨 위와 맨 아래 클릭을 통계에서 나누지 않음), 테스트 체크리스트(verify 표, 배포 뒤 운영에서 두 링크를 눌러 `outbound`로 잡히는지는 `[ ]`). 리뷰는 돌리지 않고 머지하지 않습니다. `git rev-parse HEAD`와 `origin/feat/jake-english-repo-link`가 같은지 확인합니다.
- [ ] **Step 4**: main 세션(`jake-homepage-1e`)에 PR 주소와 verify 요약을 보냅니다.
