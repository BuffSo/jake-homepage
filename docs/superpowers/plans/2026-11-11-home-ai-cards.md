# 홈 AI 카드 두 장 고치기 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 홈 "AI로 일하는 방식"의 영상 카드가 두 영상을 함께 보이고, AI 카드 네 장의 버튼이 모두 "자세히 보기" 하나가 되게 합니다.

**Architecture:** 홈 카드의 바깥 링크 표시(`links[].home`)를 없애고, 영상 카드 그림은 `video.md`의 `videos` 목록에서 마지막 두 편의 썸네일을 겹쳐 그립니다. 썸네일을 경로로 찾는 함수는 `/ai` 영상 목록과 함께 쓰도록 `src/lib`로 옮깁니다.

**Tech Stack:** Next.js 16 App Router, TypeScript, Tailwind CSS 4, `node --test`, Playwright

**Spec:** `docs/superpowers/specs/2026-11-11-home-ai-cards-design.md`

## Global Constraints

- 손으로 쓰는 길이는 rem이나 %로 씁니다. px 임의값을 쓰지 않습니다(`npm run check:units`). 테두리는 `border` 유틸리티만 씁니다.
- 공개 글은 합니다체, em dash와 en dash 없이, 제가 주어인 문장으로 씁니다. 사실은 `video.md`의 `built`와 주석, `this-site.md`에 있는 것만 씁니다.
- 진행자 장면은 "클라우드 GPU", "영상 생성 모델"까지만 씁니다.
- 커밋 메시지는 Conventional Commits 영어, 쌍따옴표 없이, AI 서명 줄 없이 씁니다. `--no-verify`를 쓰지 않습니다.
- 개발 서버는 3301을 씁니다.

## Review Focus

- 휴대폰보다 넓은 한 칸 화면(600, 744): 썸네일 두 장이 그림 칸 안에 들어야 합니다. → Task 2의 E2E가 봅니다.
- 두 칸 화면(800): 같은 확인. → Task 2의 E2E가 봅니다.
- 영상이 세 편이 되면: 홈 카드의 "영상 2편"과 설명이 낡습니다. 시험이 실패해야 합니다. → Task 2의 내용 시험이 봅니다.
- `/ai` "이 사이트" 항목의 저장소, ADR 목록, 작업 일지 링크는 그대로 보여야 합니다. → 기존 `e2e/ai.spec.ts` "상세 항목에 … 링크가 있다"가 봅니다.
- 다크 모드: 썸네일과 테두리가 어두운 바탕에서도 보여야 합니다. → Task 3의 캡처로 봅니다.

---

### Task 1: 홈 AI 카드의 바깥 링크 없애기

**Files:**
- Modify: `content/site/ai/this-site.md` (`home: true` 줄과 주석의 마지막 줄)
- Modify: `content/site/ai/video.md` (`links`를 `[]`로)
- Modify: `src/lib/content.ts:102` (`links: Link[]`)
- Modify: `src/components/home/ai-cards.tsx:55-63` (채운 버튼 그리기 삭제)
- Test: `scripts/lib/content.test.mjs:184-193`, `e2e/home.spec.ts:21-27,558-572`

**Interfaces:**
- Produces: `AiWork.links: Link[]` (`home` 없음)

- [ ] **Step 1: 내용 시험을 먼저 고칩니다**

`scripts/lib/content.test.mjs`에 시험을 더합니다.

```js
test("홈 AI 카드에는 바깥 링크를 띄우지 않는다", () => {
  for (const { file, data } of aiWorks) {
    assert.ok(data.links.every((l) => !("home" in l)), `${file}: links에 home이 남음`);
  }
});
```

영상 목록 시험의 "홈 카드는 영상 한 편을 보인다" 블록(186~192행)은 Task 2에서 바꾸므로, 여기서는 지웁니다.

- [ ] **Step 2: 실패를 확인합니다**

Run: `npm test`
Expected: FAIL `this-site.md: links에 home이 남음` (video.md도)

- [ ] **Step 3: 글과 코드를 고칩니다**

`this-site.md`에서 `home: true`와 주석 "links의 home: true인 링크만 홈 카드에 보인다."를 지웁니다. `video.md`는 `links: []`로 둡니다. `content.ts`의 `links` 타입에서 `home`을 빼고, `ai-cards.tsx`는 버튼 줄에 `<ButtonLink href={`/ai#${work.slug}`}>자세히 보기</ButtonLink>` 하나만 둡니다.

- [ ] **Step 4: E2E를 고칩니다**

`e2e/home.spec.ts` AiWork 타입의 `links`를 지우고, "AI 카드 네 장에 제목과 링크가 있고 …" 시험의 링크 확인을 바꿉니다.

```ts
const links = card.getByRole("link");
await expect(links).toHaveCount(1);
await expect(links.first()).toHaveText("자세히 보기");
await expect(links.first()).toHaveAttribute("href", `/ai#${work.slug}`);
```

시험 이름은 "AI 카드 네 장에 제목과 자세히 보기 하나가 있고, 저장소에서 센 숫자가 채워져 있다"로 바꿉니다.

- [ ] **Step 5: 확인합니다**

Run: `npm test && npm run typecheck && npm run lint`
Expected: 모두 통과

- [ ] **Step 6: 커밋합니다**

```bash
git add content/site/ai/this-site.md content/site/ai/video.md src/lib/content.ts src/components/home/ai-cards.tsx scripts/lib/content.test.mjs e2e/home.spec.ts
git commit -m "feat(app): keep only the details button on home ai cards"
```

### Task 2: 홈 영상 카드에 두 영상 보이기

**Files:**
- Create: `src/lib/asset-images.ts`
- Modify: `src/components/ai/ai-videos.tsx` (썸네일 찾기를 새 모듈로)
- Modify: `src/components/home/ai-cards.tsx` (`videos` 그림)
- Modify: `src/components/ai/ai-item.tsx` (`image` 분기와 `video.jpg` import 삭제)
- Modify: `src/lib/content.ts:99-101` (`figure`의 `"image"`를 `"videos"`로, `image`, `imageAlt` 삭제, 주석)
- Modify: `content/site/ai/video.md` (홈 카드 칸과 주석)
- Test: `scripts/lib/content.test.mjs:140,157,184-193`, `e2e/home.spec.ts`

**Interfaces:**
- Consumes: Task 1의 `AiWork.links: Link[]`
- Produces: `assetImage(file: string): StaticImageData` in `src/lib/asset-images.ts`. 글의 경로(`src/assets/…`)로 그림을 찾고, 없으면 `Error`를 던집니다. 지금 `ai-videos.tsx`의 `MODULES`와 `thumbnail()`을 그대로 옮긴 것입니다(주석의 Turbopack 주의 포함).

- [ ] **Step 1: 내용 시험을 먼저 고칩니다**

AI 글 시험의 그림 종류를 `["wiki-flow", "videos", "hermes-flow", "site-steps", "review-flow", "mcp-flow", "workbench-flow"]`로 바꾸고, `image` 확인 줄을 이것으로 바꿉니다.

```js
// 홈 카드 그림은 영상 목록의 마지막 두 편을 겹친다
if (data.figure === "videos") assert.ok(data.videos?.length >= 2, `${file}: 영상이 두 편 이상이어야 함`);
```

영상 목록 시험의 끝에 홈 카드 확인을 다시 넣습니다.

```js
// 홈 카드의 숫자는 영상 수를 말한다. 영상을 더하면 실패해, 홈 카드의 설명과 그림도 다시 보게 한다.
if (data.home !== undefined) {
  const count = Number(data.metric.value.match(/^영상 (\d+)편/)?.[1]);
  assert.equal(count, data.videos.length, `${file}: 홈 카드 숫자의 편수와 영상 수가 다름`);
}
```

- [ ] **Step 2: 실패를 확인합니다**

Run: `npm test`
Expected: FAIL `video.md: 모르는 figure image`, `홈 카드 숫자의 편수와 영상 수가 다름`

- [ ] **Step 3: video.md를 고칩니다**

정확한 값(설계 "정한 것"):

```yaml
desc: Recueve 영상은 computer use로 에이전트에게 CapCut을 조작하게 해서 만들었습니다. Jake English 영상은 대본 초안과 HTML 슬라이드, 자막을 AI로 만들고, 말하는 진행자는 클라우드 GPU에서 영상 생성 모델을 돌려 만들었습니다.
metric:
  value: 영상 2편 · 1080p
  label: 유튜브에 공개한 완성본
figure: videos
links: []
```

`note`, `image`, `imageAlt`를 지웁니다. 주석의 홈 카드 줄을 "항목의 desc, metric, figure는 홈 AI 카드에만 쓴다. 홈 카드 그림은 videos의 마지막 두 편을 같은 크기로 겹치고, 앞선 편을 뒤에 둔다. 영상을 더하면 숫자의 편수와 설명을 함께 고친다(내용 시험이 편수를 본다)."로 바꾸고, 코드 경로 언급을 `src/lib/asset-images.ts`로 고칩니다.

- [ ] **Step 4: 타입과 썸네일 모듈을 고칩니다**

`content.ts`의 `figure`에서 `"image"`를 `"videos"`로 바꾸고 `image`, `imageAlt`를 지웁니다. `AiWork` 주석의 "항목의 그림, 숫자, 링크는 홈 카드에만 쓴다"를 "항목의 그림(videos)과 숫자는 홈 카드에만 쓴다"로 고칩니다. `asset-images.ts`를 만들고 `ai-videos.tsx`가 `assetImage`를 쓰게 합니다. `ai-item.tsx`의 `image` 분기와 `video.jpg` import를 지웁니다.

- [ ] **Step 5: 홈 카드 그림을 그립니다**

`ai-cards.tsx`의 `Figure`에 `case "videos"`를 두고, 맨 위의 `video.jpg` import와 `image` 분기를 지웁니다. 마크업의 값(설계 "그림의 값"):

- 바깥: `${CARD_FRAME} bg-surface`
- 무대: `relative mx-auto aspect-[2/1] h-full max-w-full`
- 썸네일 공통: `absolute aspect-video w-[64%] rounded-md border border-line object-cover lg:rounded-lg`
- 뒤(`videos.at(-2)`): `top-[9%] left-[7%]`, 앞(`videos.at(-1)`): `right-[7%] bottom-[9%]`
- `alt`는 각 영상의 `thumbnailAlt`, `sizes`는 썸네일이 카드 폭의 64%인 것에서 셈(예: `(min-width: 80rem) 23rem, (min-width: 48rem) 29vw, 60vw`)

- [ ] **Step 6: E2E를 더합니다**

`e2e/home.spec.ts`의 홈 AI 카드 묶음에 시험 둘을 더합니다. 영상 카드는 `section.getByRole("article").filter({ hasText: video.headline })`로 찾고, 썸네일 설명은 `video.md`의 `videos`에서 읽습니다.

```ts
test("영상 카드는 두 영상의 썸네일을 겹치고, 나중 영상이 앞 오른쪽 아래에 있다", ...)
// imgs = card.getByRole("img"); toHaveCount(2)
// 첫째 alt = videos[0].thumbnailAlt (Recueve), 둘째 alt = videos[1].thumbnailAlt (Jake English)
// back = boundingBox(첫째), front = boundingBox(둘째): front.x > back.x, front.y > back.y

test("영상 카드의 썸네일은 화면 폭이 달라도 그림 칸 안에 든다", ...)
// for width of [600, 744, 800]: page.setViewportSize({ width, height: 900 }), goto("/")
// frame = 썸네일들의 부모의 부모(그림 칸) boundingBox
// 각 썸네일 box가 frame 안: box.y >= frame.y, box.y + box.height <= frame.y + frame.height + 1, 가로도 같음
```

둘째 시험은 데스크톱 프로젝트에서만 돌립니다(`test.skip(testInfo.project.name !== "desktop")`, 프로젝트 이름은 `playwright.config.ts`에서 확인).

- [ ] **Step 7: 확인합니다**

Run: `npm test && npm run typecheck && npm run lint && npm run check:units`
Expected: 모두 통과

개발 서버(3301)를 `.next/dev`를 지우고 다시 띄운 뒤 홈을 1280, 375, 600, 744로 열어 비교판(`video-card-final3.html`)과 같은지 봅니다.

- [ ] **Step 8: 커밋합니다**

```bash
git add src/lib/asset-images.ts src/components/ai/ai-videos.tsx src/components/ai/ai-item.tsx src/components/home/ai-cards.tsx src/lib/content.ts content/site/ai/video.md scripts/lib/content.test.mjs e2e/home.spec.ts
git commit -m "feat(app): show both videos on the home video card"
```

### Task 3: 문서와 캡처

**Files:**
- Create: `docs/design/home-ai-cards/` (캡처), `docs/devlog/2026-11-11-home-ai-cards.md`
- Modify: `docs/02-ia.md` (홈 3 표와 그 아래, `/ai` 영상 제작 bullet), `docs/03-design.md` (F3 절 끝에 홈 영상 카드 그림), `docs/guide/CONTENT_AI_사례_20261020.md` (영상 제작 절의 홈 카드 줄, 확인 줄, 그림을 경로로 찾기 줄의 파일 위치)

- [ ] **Step 1: 캡처를 둡니다**

비교판 폴더(이 세션의 scratchpad `board/`)에서 옮깁니다: `now-1280.png`, `a-1280.png`, `b-1280.png`, `c-1280.png`를 `options-now-1280.png`, `options-a-1280.png`, `options-b-1280.png`, `options-c-1280.png`로. 구현 캡처는 개발 서버에서 새로 찍습니다: `after-1280.png`, `after-375.png`, `after-1280-dark.png`, `after-375-dark.png`(첫 줄 두 카드, 375는 영상 카드).

- [ ] **Step 2: 문서를 고칩니다**

- IA 홈 3: 구성 줄에 "카드마다 버튼은 자세히 보기 하나"를, 영상 제작 줄의 숫자를 "영상 2편 · 1080p (유튜브에 공개한 완성본)"로, 그림을 "두 썸네일을 같은 크기로 겹침(먼저 만든 Recueve 뒤, Jake English 앞)"으로 바꿉니다. 표 아래에 바깥 링크를 뺀 이유(영상은 두 편을 /ai에서 보고, 저장소는 /ai 항목에서 엶)와 그림 차례의 이유를 씁니다.
- IA `/ai` 영상 제작: "홈 AI 카드는 그대로 Recueve 소개 영상 한 편을 보입니다 …" bullet을 새 모양으로 바꿉니다.
- 디자인: 그림 칸, 무대, 썸네일 값과 고른 과정(지금, A, B, C 비교, B 선택), 캡처 표.
- 가이드: 홈 카드 줄을 "두 편을 겹쳐 보입니다 …"로, 확인 줄을 새 시험에 맞게 고칩니다.
- devlog: 양식(`docs/devlog/README.md`)대로. 흐름 표에 "사용자가 홈 영상 카드는 두 편을 아우르게 하고, 홈 카드의 바깥 링크(영상, 저장소)를 빼 자세히 보기로 모으자고 했다"와 그림, 차례, 설명 문구, 숫자의 판단을 남깁니다.

- [ ] **Step 3: 확인합니다**

Run: `npm run check:sensitive && npm test`
Expected: 통과. em dash(U+2014)와 en dash(U+2013)가 없는지 바꾼 문서를 grep으로 봅니다.

- [ ] **Step 4: 커밋합니다**

```bash
git add docs/design/home-ai-cards docs/02-ia.md docs/03-design.md docs/guide/CONTENT_AI_사례_20261020.md docs/devlog/2026-11-11-home-ai-cards.md docs/superpowers
git commit -m "docs: record the two-video home card and details-only buttons"
```

### Task 4: 전체 확인과 PR

- [ ] **Step 1:** `npm run verify`를 돌립니다. Expected: 모든 검사 통과(E2E 포함). 실패하면 요약 표와 실패 내용을 그대로 남깁니다.
- [ ] **Step 2:** push하고 `gh pr create`로 PR을 엽니다. 본문은 CLAUDE.md "브랜치와 PR"의 절(요약, 배경, 한계, 테스트 체크리스트)을 따르고, AI 서명 줄을 넣지 않습니다.
- [ ] **Step 3:** 개발 서버(3301)를 `.next/dev`를 지우고 다시 띄우고, 홈의 CSS에 새 규칙(`aspect-[2/1]`)이 있는지 curl로 봅니다.
