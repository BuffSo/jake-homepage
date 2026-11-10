# /ai Jake English 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `/ai` 맨 위에 Jake English 띠를 사례 띠와 나란히 두고, `/ai/jake-english` 페이지(영상, 연습 흐름 4컷, 본문 다섯 장, 끝 링크)를 더합니다.

**Architecture:** 글은 사이트 전용 글 `content/site/jake-english.md` 한 파일의 frontmatter에 두고 `getJakeEnglish()`로 읽습니다. 그림은 `src/assets/ai/jake-english/`에 커밋하고 `src/lib/jake-english-images.ts`에서 정적 import로 묶습니다. 띠는 사례 띠와 같은 컴포넌트 `AiEntry`로 합치고, 페이지는 `/ai/case`와 같은 틀의 새 라우트입니다.

**Tech Stack:** Next.js 16 App Router, TypeScript, Tailwind CSS 4, `next/image`, Playwright, `node --test`

**Spec:** `docs/superpowers/specs/2026-11-11-ai-jake-english-design.md`

## Global Constraints

- 문구는 설계 문서 "문구" 표 그대로 씁니다(띠, 페이지 머리, W3~W10). 한 글자도 바꾸지 않습니다.
- 사이트 글은 합니다체, 제가 주어인 문장입니다. em dash(U+2014)와 en dash(U+2013)를 쓰지 않습니다.
- 길이는 rem, 테두리는 `border` 유틸리티만 씁니다. `npm run check:units`가 손으로 쓴 px를 잡습니다.
- 의존성을 더하지 않습니다. 그림은 `next/image`와 정적 import로 넣습니다(기존 `src/lib/project-images.ts` 방식).
- 코드를 쓰기 전에 `node_modules/next/dist/docs/01-app/03-api-reference/02-components/image.md`를 읽습니다(AGENTS.md).
- 공개 글(코드 주석, 문서, 커밋, PR)에 소개 영상을 만든 작업 폴더의 이름과 경로를 쓰지 않습니다. "소개 영상을 만든 작업 폴더(이 저장소 밖)"로만 씁니다.
- 커밋은 Conventional Commits 영어, 쌍따옴표 없이 씁니다. AI 공동 작성자 줄을 넣지 않고 `--no-verify`를 쓰지 않습니다.
- E2E(포트 3210)와 `npm run verify`는 Task 4에서 컨트롤러만 돌립니다. 다른 Task는 E2E 파일을 쓰기만 하고 돌리지 않습니다.
- 개발 서버는 3301입니다(`./node_modules/.bin/next dev -p 3301`, 이미 떠 있으면 그대로 씁니다).

## Review Focus

- **lg 최소 폭(1024)에서 띠 제목이 두 줄이 될 때**: 1024 폭에서 Jake English 띠 제목이 두 줄이 되면 사례 띠보다 글이 길어집니다. 두 띠의 작은 그림 줄은 같은 높이에 있어야 합니다. Task 2의 1024 폭 테스트가 확인합니다.
- **같은 목적지로 잡히는 두 유튜브 링크**: 방문 통계는 쿼리를 떼므로 Recueve 영상과 Jake English 영상이 둘 다 `www.youtube.com/watch`로 잡힙니다. 누른 페이지(`from`)로 구분되는지 Task 3의 단위 테스트가 확인합니다.
- **다크 모드의 그림 가장자리**: 4컷 칸과 띠 작은 그림의 가장자리에 흰 화소가 있으면 다크 모드에서 흰 테두리로 보입니다(사례 4컷에서 겪은 문제). Task 1에서 모서리 화소를 읽고, Task 4에서 다크 캡처를 봅니다.
- **장식 그림이 늘어난 `/ai`의 대체 텍스트 검사**: 새 띠의 작은 그림은 대체 텍스트를 비웁니다. `/ai`의 "이미지마다 대체 텍스트" 테스트가 이 그림을 잡지 않게 Task 2에서 고칩니다.
- **320 폭의 가로 스크롤**: 가장 좁은 폰에서 띠 제목, 영상 아래 한 줄, 숫자 장이 넘치지 않아야 합니다. Task 3의 320 폭 테스트가 확인합니다.

---

### Task 1: 글과 그림

컨트롤러가 직접 합니다. 그림의 원본은 저장소 밖에 있습니다.

**Files:**
- Create: `content/site/jake-english.md`
- Create: `src/assets/ai/jake-english/video.jpg`, `flow-1.jpg`~`flow-4.jpg`, `entry-1.jpg`~`entry-4.jpg`, `slide-1.jpg`~`slide-4.jpg`
- Create: `src/lib/jake-english-images.ts`
- Modify: `src/lib/content.ts` (타입과 `getJakeEnglish()`)
- Test: `scripts/lib/content.test.mjs`

**Interfaces:**
- Produces:
  - `type JakeEnglishChapter = { title: string; body: string; metric?: Metric }`
  - `type JakeEnglish = { title: string; subtitle: string; description: string; video: { href: string; caption: string }; panels: { caption: string }[]; chapters: JakeEnglishChapter[] }`
  - `getJakeEnglish(): JakeEnglish` (`src/lib/content.ts`)
  - `VIDEO_THUMB: StaticImageData`, `FLOW_IMAGES: StaticImageData[]`(4컷 칸 순서), `ENTRY_IMAGES: StaticImageData[]`(띠 작은 그림, 칸 순서), `SLIDE_IMAGES: StaticImageData[]`(본문 1~4장) (`src/lib/jake-english-images.ts`)

그림 파일(모두 공개한 소개 영상에서 가져온 것):

| 파일 | 크기 | 만드는 법 |
|---|---|---|
| `video.jpg` | 1920×1080 | 영상 썸네일 원본(PNG)을 `ffmpeg -i <썸네일> -q:v 3 video.jpg` |
| `flow-1.jpg`~`flow-4.jpg` | 1280×720 | 설계 시안에서 찍은 4컷 칸(B-a: 1, 2, 3, 4a)의 1280 폭 JPG |
| `entry-1.jpg`~`entry-4.jpg` | 462×462 | 4컷 칸 PNG(1920×1080)에서 폰 화면을 `crop=462:462:245:<y>`, y는 칸 순서대로 335, 155, 415, 505 |
| `slide-1.jpg`~`slide-4.jpg` | 1560×690 | 다시 찍은 슬라이드(1920×1080)에서 제목 줄을 뺀 `crop=1560:690:40:230` (설계 시안과 같은 자리) |

- [ ] **Step 1: 실패하는 테스트를 씁니다**

`scripts/lib/content.test.mjs` 끝에 더합니다.

```js
test("Jake English 글은 4컷 넷과 장 다섯이고, 숫자는 마지막 장에만 있다", () => {
  const je = read("content/site/jake-english.md");
  for (const key of ["title", "subtitle", "description"]) assert.ok(je[key], `${key}가 없습니다`);
  assert.match(je.video.href, /^https:\/\/www\.youtube\.com\/watch\?v=[\w-]{11}$/);
  assert.ok(je.video.caption);
  assert.equal(je.panels.length, 4);
  for (const panel of je.panels) assert.ok(panel.caption);
  assert.equal(je.chapters.length, 5);
  je.chapters.forEach((chapter, i) => {
    assert.ok(chapter.title && chapter.body, `${i + 1}장에 소제목이나 문단이 없습니다`);
    assert.equal(Boolean(chapter.metric), i === 4, `${i + 1}장의 숫자`);
  });
  assert.deepEqual(je.chapters[4].metric, { value: "PR 78개", label: "2026-11-04 ~ 11-09 · 머지한 PR" });
});
```

- [ ] **Step 2: 실패를 확인합니다**

Run: `node --test scripts/lib/content.test.mjs`
Expected: 새 테스트가 ENOENT(`content/site/jake-english.md`)로 FAIL

- [ ] **Step 3: `content/site/jake-english.md`를 씁니다**

```md
---
title: 직접 만들어 쓰는 영어 말하기 연습 앱
subtitle: Jake English
description: 해 보고 싶은 상황을 직접 정해 AI 선생님과 영어로 대화하고, 듣고 따라 말하며 연습하는 앱입니다.
video:
  href: https://www.youtube.com/watch?v=5FByJLa8R1k
  caption: 소개 영상 · 3분 17초 · YouTube에서 보기
panels:
  - caption: 앱을 열면 라이언이 인사하고, 오늘 무엇을 연습할지 묻습니다.
  - caption: 해 보고 싶은 상황을 직접 말하거나 쓰면 그 상황의 대본이 만들어집니다. 목록에서 고르거나 추천받을 수도 있습니다.
  - caption: 자유 대화에서 말이 막히면 소희가 무엇을 묻는지 알려 주고, 답을 시작할 영어 첫마디를 줍니다.
  - caption: 라이언의 본보기를 듣고 따라 말합니다(섀도잉). 0.6배, 0.8배로 느리게 다시 듣고, 세게 읽을 곳과 한글 발음도 봅니다. 따라 말하면 다르게 들린 낱말을 짚어 줍니다.
chapters:
  - title: 왜 만들었나
    body: (W9-1 그대로)
  - title: 어떻게 동작하나
    body: (W9-2 그대로)
  - title: AI와 일한 방식
    body: (W9-3 그대로)
  - title: 일하는 구조
    body: (W9-4 그대로)
  - title: 닷새 남짓 동안 머지한 PR
    metric:
      value: PR 78개
      label: '2026-11-04 ~ 11-09 · 머지한 PR'
    body: (W10 그대로)
---
```

frontmatter 아래 HTML 주석에 남깁니다: 사이트 전용 글이고 이력서와 포트폴리오에 없다는 것(ADR-0003), 앱의 구성(whisper.cpp, Qwen3-TTS, Claude API, Tailscale)은 2026-11-11 본인 확인, PR 수는 jake-english 저장소에서 `gh pr list --state merged`로 2026-11-11에 센 값(11-04~11-09 78개, pr-review 코멘트 58개), 영상 아래 한 줄의 → 는 화면에서 붙인다는 것.

- [ ] **Step 4: `getJakeEnglish()`와 타입을 `src/lib/content.ts`에 더합니다**

`read<JakeEnglish>("jake-english.md")`를 돌려줍니다. `content/site/ai/`가 아니라 바로 아래라 `/ai` 항목 목록에 잡히지 않습니다.

- [ ] **Step 5: 테스트가 통과하는지 확인합니다**

Run: `node --test scripts/lib/content.test.mjs`
Expected: PASS

- [ ] **Step 6: 그림을 만들고 `src/lib/jake-english-images.ts`를 씁니다**

위 표대로 만듭니다. 모듈 머리 주석에 그림의 출처(공개한 소개 영상의 썸네일, 슬라이드, 시연 영상)와 만든 방법은 `docs/guide/CONTENT_AI_사례_20261020.md`에 있다고 씁니다.

- [ ] **Step 7: 다크 모드 가장자리를 확인합니다**

sharp로 `flow-*.jpg`와 `entry-*.jpg`의 네 모서리 화소를 읽습니다(스크립트는 scratchpad에 둡니다).
Expected: `flow-*`의 모서리는 칸 바탕 `#14161c` 근처(각 채널 ±12)이고 흰색(각 채널 240 이상)이 없습니다. `entry-*`는 값을 출력해 Task 4의 다크 캡처와 함께 봅니다.

- [ ] **Step 8: 타입 검사와 커밋**

Run: `npm run typecheck && npm run check:sensitive`
Expected: 둘 다 통과

```bash
git add content/site/jake-english.md src/assets/ai/jake-english src/lib/jake-english-images.ts src/lib/content.ts scripts/lib/content.test.mjs
git commit -F - <<'EOF'
feat(content): add the Jake English page text and images

Site-only text for the new /ai/jake-english page and the images taken
from the public intro video: thumbnail, practice-flow panels, entry
thumbnails and four slides re-rendered without the title row.
EOF
```

---

### Task 2: `/ai` 맨 위의 두 띠

**Files:**
- Create: `src/components/ai/ai-entry.tsx`
- Delete: `src/components/ai/case-entry.tsx`
- Modify: `src/app/ai/page.tsx`
- Test: `e2e/ai.spec.ts`

**Interfaces:**
- Consumes: `getJakeEnglish()`, `ENTRY_IMAGES` (Task 1), `CasePanel` (`src/components/ai/case-panel.tsx`)
- Produces: `AiEntry({ href, eyebrow, title, children }: { href: string; eyebrow: string; title: string; children: ReactNode })`

- [ ] **Step 1: E2E를 고칩니다 (돌리지 않음)**

`e2e/ai.spec.ts`에서 `content/site/jake-english.md`의 `title`을 읽어 둡니다(`je`).

- "머리 아래, 목차 위의 사례 입구가 /ai/case로 간다"를 `"머리 아래, 목차 위의 두 입구가 각자 페이지로 간다"`로 바꿉니다. `[["AI 도구 활용 사례 자세히 보기", "/ai/case"], [`${je.title} 자세히 보기`, "/ai/jake-english"]]`마다 href, 목차보다 앞, `img` 넷과 모두 `alt=""`, 누르면 그 주소로 가는지 봅니다. 사례 입구가 Jake English 입구보다 문서에서 앞인지도 봅니다.
- 새 테스트 `"데스크톱은 두 입구가 한 줄에 나란히, 모바일은 사례 입구 아래에 Jake English 입구가 있다"`: `boundingBox()`로 데스크톱은 두 상자의 `y` 차이 1 미만이고 Jake English의 `x`가 더 큽니다. 모바일은 Jake English의 `y`가 사례 상자의 `y + height` 이상입니다.
- 새 테스트 `"lg 최소 폭에서도 두 입구의 작은 그림 줄이 같은 높이다"`: 모바일이면 건너뜁니다. 폭 1024와 1280에서 각 입구 첫 `img`의 `getBoundingClientRect().top` 차이가 1 미만입니다.
- "이미지마다 대체 텍스트가 있고" 테스트의 선택자에서 `a[href="/ai/jake-english"] img`도 뺍니다.

- [ ] **Step 2: `AiEntry`를 만들고 `CaseEntry`를 지웁니다**

`case-entry.tsx`의 링크 모양을 옮기되, 두 띠가 나란히 서도록 칸 안을 한 줄 짜임으로 바꿉니다.
- 링크: `aria-label={`${title} 자세히 보기`}`, `group flex flex-col gap-4 rounded-[0.625rem] border border-line p-[1.125rem] lg:gap-8 lg:rounded-xl lg:px-7 lg:py-6`
- 글: 지금과 같습니다(`Eyebrow`, 제목 `text-[1.1875rem] font-bold lg:text-[1.375rem]`, 테두리 버튼 "자세히 보기→").
- 작은 그림 줄: `mt-auto grid grid-cols-4 gap-1.5 lg:gap-2`에 `children`. `mt-auto`가 제목이 두 줄인 이웃 띠와 그림 줄 높이를 맞춥니다.
- 머리 주석에 두 띠가 쓰는 곳(`/ai` 맨 위)과 맞춘 이유를 씁니다.

- [ ] **Step 3: `src/app/ai/page.tsx`에 두 띠를 둡니다**

`<CaseEntry />` 자리에 `mb-6 grid gap-3 lg:mb-10 lg:grid-cols-2 lg:gap-4` 상자를 두고 사례 띠, Jake English 띠 순서로 넣습니다.
- 사례 띠: `eyebrow={`CASE · ${aiCase.subtitle}`}`, 작은 그림은 `CasePanel`(`sizes="(min-width: 64rem) 18rem, 57vw"`, `rounded-md border border-line-soft`)
- Jake English 띠: `eyebrow={`APP · ${je.subtitle}`}`, 작은 그림은 `ENTRY_IMAGES`의 `next/image`(`alt=""`, `sizes="(min-width: 64rem) 8rem, 22vw"`, `aspect-square w-full rounded-md border border-line-soft`)
- 파일 머리 주석의 순서를 "머리 → 입구 띠 둘 → 목차 → 네 묶음"으로 고칩니다.

- [ ] **Step 4: 검사합니다**

Run: `npm run typecheck && npm run lint && npm run check:units && npm test`
Expected: 모두 통과

Run: `curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3301/ai`
Expected: `200`

- [ ] **Step 5: 커밋**

```bash
git add src/components/ai/ai-entry.tsx src/components/ai/case-entry.tsx src/app/ai/page.tsx e2e/ai.spec.ts
git commit -F - <<'EOF'
feat(app): show the Jake English entry beside the case entry on /ai

Both entries share one component so they keep the same weight; side by
side on desktop, stacked with the case entry first on mobile.
EOF
```

---

### Task 3: `/ai/jake-english` 페이지

**Files:**
- Create: `src/app/ai/jake-english/page.tsx`
- Create: `e2e/ai-jake-english.spec.ts`
- Modify: `src/app/sitemap.ts`, `e2e/seo.spec.ts`, `scripts/lib/captures.mjs`, `scripts/lib/captures.test.mjs`, `e2e/home.spec.ts`, `scripts/lib/outbound.test.mjs`, `CLAUDE.md`(캡처 장 수)

**Interfaces:**
- Consumes: `getJakeEnglish()`, `VIDEO_THUMB`, `FLOW_IMAGES`, `SLIDE_IMAGES` (Task 1), `SectionHead`, `ButtonLink`, `ExternalLink`, `pageMetadata`

- [ ] **Step 1: 단위 테스트를 고칩니다**

- `scripts/lib/captures.test.mjs`: 이름을 `"여섯 페이지의 라이트와 다크, 이력서 인쇄를 두 폭으로 찍어 26장이다"`로 바꾸고 `files.length`를 26, `files.includes("ai-jake-english-dark-375.png")`를 더합니다. 아래 테스트의 22도 26으로 바꿉니다.
- `scripts/lib/outbound.test.mjs`에 `"유튜브 영상 링크는 목적지가 같아도 누른 페이지로 구분한다"`: `outboundEvent("https://www.youtube.com/watch?v=5FByJLa8R1k", "https://jakeso.dev/ai/jake-english")`가 `{ to: "www.youtube.com/watch", from: "/ai/jake-english" }`이고, Recueve 영상(`l8j7xHA2hTA`)을 `/ai`에서 누르면 `from`이 `/ai`입니다.

Run: `npm test`
Expected: captures 테스트 FAIL(22 ≠ 26), outbound 테스트 PASS(이미 동작함을 고정)

- [ ] **Step 2: `scripts/lib/captures.mjs`의 `PAGES`에 `"ai-jake-english"`를 `"ai-case"` 다음에 더하고, `CLAUDE.md`의 "캡처 22장"을 26장으로 고칩니다**

Run: `npm test`
Expected: PASS

- [ ] **Step 3: E2E를 씁니다 (돌리지 않음)**

`e2e/ai-jake-english.spec.ts`는 `e2e/ai-case.spec.ts`의 틀을 따르고, 기대값은 `content/site/jake-english.md`에서 읽습니다.
- `"페이지가 열리고 콘솔 오류와 실패한 요청이 없다"`: 200, `networkidle` 뒤 `collectErrors` 비어 있음
- `"브라우저 제목, 머리글, 제목, 부제가 글과 같다"`: 제목 `${je.title} · 소재희`, h1 `je.title`, `AI / APP`, `je.subtitle`
- `"영상 썸네일과 아래 한 줄이 유튜브로 가는 링크 하나다"`: 이름에 `je.video.caption`이 든 링크의 href가 `je.video.href`, `target="_blank"`, 안에 그림이 있습니다
- `"연습 흐름은 네 칸이고, 칸마다 번호와 설명이 있다"`: `getByRole("region", { name: "연습 흐름" })`의 `listitem` 넷, `figcaption`이 `${i + 1}${caption}`
- `"본문 다섯 장은 순서대로 머리글, 소제목, 문단이고, 1~4장은 그림, 5장은 숫자다"`: 장마다 `region` 이름이 소제목, 머리글 `${i + 1} / 5`, 문단이 `body`. 1~4장은 `img` 하나, 5장은 `img` 없이 `metric.value`와 `metric.label`이 보입니다
- `"끝 링크는 영상 보기와 AI로 일하는 방식이다"`: "영상 보기" href가 `je.video.href`, "AI로 일하는 방식" 링크 둘(돌아가기, 끝), 첫째를 누르면 `/ai`
- `"가로 스크롤이 생기지 않는다 (지금 폭과 320)"`: 지금 폭에서 보고, `setViewportSize({ width: 320, height: 800 })` 뒤 `/ai/jake-english`와 `/ai`를 다시 봅니다
- `"그림을 모두 불러온다"`: `main img` 아홉 장(영상 1, 4컷 4, 슬라이드 4), 스크롤해 `complete && naturalWidth > 0`
- `"캡처를 남긴다 (라이트, 다크)"`: 그림을 모두 스크롤해 불러온 뒤 `capturePath(page, `ai-jake-english-${scheme}`)` 전체 페이지

다른 E2E:
- `e2e/seo.spec.ts`의 `PAGES`에 `"/ai/jake-english"`를 `"/ai/case"` 다음에 더합니다.
- `e2e/home.spec.ts` "헤더에 지금 보는 페이지가 표시된다"의 목록에 `["/ai/jake-english", "AI", "true"]`를 더하고, 주석의 예에 이 경로를 더합니다.

- [ ] **Step 4: 사이트맵에 더합니다**

`src/app/sitemap.ts`의 `PATHS`에 `"/ai/jake-english"`를 `"/ai/case"` 다음에 더합니다(SEO 테스트가 순서까지 봅니다).

- [ ] **Step 5: `src/app/ai/jake-english/page.tsx`를 씁니다**

`src/app/ai/case/page.tsx`의 틀과 클래스를 그대로 따르고, 다른 점만 적습니다.
- 메타: `pageMetadata({ title: `${je.title} · 소재희`, description: je.description, path: "/ai/jake-english" })`
- 머리: `SectionHead as="h1" id="je-title" label="AI / APP" title={je.title} intro={je.subtitle}`
- 영상: `ExternalLink href={je.video.href}`, `group mb-10 block lg:mb-14 lg:max-w-[52rem]`. 안에 `relative overflow-hidden rounded-xl border border-line` 상자와 `VIDEO_THUMB`(`alt=""`, `sizes="(min-width: 64rem) 52rem, 100vw"`, `aspect-video w-full object-cover`, eager). 가운데 재생 표시는 `aria-hidden` 상자(`size`가 4.5rem × 3.125rem, `rounded-[0.875rem]`, 검정 72% 바탕)에 흰 삼각형 SVG(폭 1.125rem)입니다. 테두리 삼각형 트릭은 쓰지 않습니다. 아래 줄은 `mt-3 block text-sm text-muted group-hover:text-fg`에 `je.video.caption`과 `aria-hidden` →.
- 연습 흐름: `section aria-labelledby="flow-title" className="border-t border-fg pt-7 lg:pt-10"`, h2 "연습 흐름"(`mb-5 text-2xl font-extrabold tracking-[-0.02em] lg:mb-6 lg:text-[2rem]`), `ol`은 사례 4컷과 같은 격자. 칸 그림은 `FLOW_IMAGES[i]`(`alt=""`, `sizes="(min-width: 64rem) 26rem, 100vw"`, `aspect-video w-full rounded-[0.625rem] border border-line`), 설명은 사례와 같은 번호 원과 `figcaption`.
- 본문: `div className="mt-14 border-t border-line pt-14 lg:mt-24 lg:pt-24"` 안에 `max-w-[45rem]`. 장마다 `section aria-labelledby={`chapter-${i + 1}`}`, 둘째 장부터 `mt-12 lg:mt-16`.
  - 머리글: `font-mono text-[0.6875rem] tracking-[0.04em] text-subtle lg:text-[0.8125rem]`에 `${i + 1} / ${je.chapters.length}`
  - 소제목: h2 `mt-1 mb-4 text-xl font-extrabold tracking-[-0.02em] lg:text-2xl`
  - 그림 또는 숫자: `metric`이 없으면 `SLIDE_IMAGES[i]`(`alt=""`, `sizes="(min-width: 64rem) 45rem, 100vw"`, `w-full rounded-[0.625rem] border border-line`), 있으면 `flex flex-col gap-0.5 border-t border-line-soft pt-2.5 lg:pt-3` 안에 값 `text-[2rem] font-bold lg:text-[2.5rem]`과 설명 `text-xs text-subtle`
  - 문단: `mt-4 text-[0.9375rem] leading-[1.75] lg:text-[1.0625rem]`
- 끝 링크: `mt-12 flex flex-wrap gap-2`에 `ButtonLink href={je.video.href} variant="solid"` "영상 보기", `ButtonLink href="/ai"` "AI로 일하는 방식"(`ai.title`)
- 맨 위로 버튼과 다음 페이지 버튼은 두지 않습니다.
- 파일 머리 주석: 순서(돌아가기 → 머리 → 영상 → 연습 흐름 → 본문 다섯 장 → 끝 링크), 사이트 전용 글이라는 것, 그림의 대체 텍스트를 비운 이유(설명과 문단이 같은 내용을 말함), 맨 위로 버튼이 없는 이유(`/ai/case`와 같은 서브페이지).

- [ ] **Step 6: 검사합니다**

Run: `npm run typecheck && npm run lint && npm run check:units && npm test`
Expected: 모두 통과

Run: `curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3301/ai/jake-english`
Expected: `200`

- [ ] **Step 7: 커밋**

```bash
git add src/app/ai/jake-english e2e/ai-jake-english.spec.ts src/app/sitemap.ts e2e/seo.spec.ts e2e/home.spec.ts scripts/lib/captures.mjs scripts/lib/captures.test.mjs scripts/lib/outbound.test.mjs CLAUDE.md
git commit -F - <<'EOF'
feat(app): add the /ai/jake-english page

Intro video link, the practice flow in four panels and the five
chapters of the video, in the same frame as /ai/case. The page joins
the sitemap, the SEO checks and the main screen captures.
EOF
```

---

### Task 3b: 4컷 만화 (4컷 C 결정, 2026-11-11)

Task 3 뒤에 사용자가 4컷을 C로 정했습니다. Gemini 앱으로 그린 4컷 만화를 페이지의 첫 4컷과 띠의 작은 그림으로 쓰고, B-a는 "연습 흐름"으로 그대로 둡니다. 설계 문서의 "정한 것", "그림", "문구"(W11~W14)를 함께 고쳤습니다.

**Files:**
- Create: `src/assets/ai/jake-english/comic-1.jpg`~`comic-4.jpg` (1200×1200, 컨트롤러가 미리 둡니다)
- Delete: `src/assets/ai/jake-english/entry-1.jpg`~`entry-4.jpg`
- Modify: `content/site/jake-english.md`, `src/lib/content.ts`, `src/lib/jake-english-images.ts`, `src/app/ai/page.tsx`, `src/app/ai/jake-english/page.tsx`
- Test: `scripts/lib/content.test.mjs`, `e2e/ai-jake-english.spec.ts`

**Interfaces:**
- Produces: `JakeEnglish.comic: { caption: string }[]`, `COMIC_IMAGES: StaticImageData[]` (만화 칸 순서). `ENTRY_IMAGES`는 없앱니다.

- [ ] **Step 1: 테스트를 고칩니다**
  - `scripts/lib/content.test.mjs`의 Jake English 테스트에 `assert.equal(je.comic.length, 4)`와 칸마다 `caption` 확인을 더합니다. 실패를 확인합니다.
  - `e2e/ai-jake-english.spec.ts` (돌리지 않음)
    - 새 테스트 `"4컷 만화는 네 칸이고, 칸마다 번호와 설명이 있고, 연습 흐름보다 앞이다"`: region "4컷 만화"의 `listitem` 넷, `figcaption`이 `${i + 1}${caption}`, 그림 상자가 정사각에 가깝습니다(폭/높이와 1의 차이 0.02 미만), 문서 순서가 "연습 흐름"보다 앞입니다.
    - "그림을 모두 불러온다"의 장 수를 9에서 13(영상 1, 만화 4, 연습 흐름 4, 슬라이드 4)으로 고칩니다.
- [ ] **Step 2: 글에 만화 칸 설명을 더합니다**
  - `content/site/jake-english.md`의 `panels` 앞에 `comic:` 목록을 두고 설계의 W11~W14를 그대로 씁니다.
  - 주석에 남깁니다. 만화는 Gemini 앱으로 그린 그림입니다. 만화 절 소제목 "4컷 만화"와 W11~W14는 추천안으로 정한 문구이고 사용자 확인 전입니다(2026-11-11).
  - `src/lib/content.ts`의 `JakeEnglish`에 `comic`을 더합니다.
- [ ] **Step 3: 그림 모듈을 고칩니다**
  - `src/lib/jake-english-images.ts`에서 `ENTRY_IMAGES`를 `COMIC_IMAGES`(comic-1~4)로 바꾸고, `entry-*.jpg`를 지웁니다.
  - 머리 주석의 띠 작은 그림 설명은 "4컷 만화를 띠에서도 작게 쓴다"로 고칩니다.
- [ ] **Step 4: 띠의 작은 그림을 만화로 바꿉니다**
  - `src/app/ai/page.tsx`의 Jake English 띠가 `COMIC_IMAGES`를 씁니다. 클래스와 `sizes`는 그대로 둡니다.
- [ ] **Step 5: 페이지에 만화 절을 더합니다**
  - 영상 다음, 연습 흐름 앞에 둡니다.
  - 만화 절은 `section aria-labelledby="comic-title" className="border-t border-fg pt-7 lg:pt-10"`이고 h2는 "4컷 만화"입니다. 연습 흐름 절은 `mt-14 border-t border-line pt-14 lg:mt-24 lg:pt-24`로 바꿉니다(본문 절과 같은 간격).
  - 두 절의 목록과 칸 마크업은 같으므로, 페이지 파일 안의 작은 컴포넌트 `Panels({ images, captions, aspect })` 하나로 그립니다. `aspect`는 `"aspect-square"` 또는 `"aspect-video"`입니다.
  - 만화 칸 그림은 `alt=""`, `sizes="(min-width: 64rem) 26rem, 100vw"`입니다. 첫 절이므로 eager로 둡니다.
  - 파일 머리 주석의 순서에 4컷 만화를 더합니다.
- [ ] **Step 6: 검사와 커밋**

Run: `npm run typecheck && npm run lint && npm run check:units && npm test`, curl로 `/ai`와 `/ai/jake-english`가 200
Expected: 모두 통과

커밋 메시지(`git commit -F -`로 넘깁니다):

```text
feat(app): add the comic panels to the Jake English page and entry

The comic tells why the app exists and how it is used; the practice
flow below it keeps the real app screens. The /ai entry shows the comic
like the case entry shows its own panels.
```

---

### Task 4: 전체 검증

컨트롤러가 합니다.

- [ ] **Step 1: main 세션에 E2E(포트 3210)를 돌린다고 알리고, 답을 받은 뒤 돌립니다**

Run: `npm run verify`
Expected: 요약 표에서 실패 없음. 로컬 전용 검사가 건너뛰어졌으면 그대로 적습니다.

- [ ] **Step 2: 캡처를 봅니다**

`test-results/captures/`의 `ai-*`, `ai-jake-english-*` 여덟 장을 엽니다.
Expected: 다크 모드에서 만화, 연습 흐름 칸과 띠 작은 그림에 흰 테두리가 없습니다. 1280에서 두 띠가 나란히, 375에서 사례 띠 아래에 Jake English 띠가 있습니다. 설계 시안과 짜임이 같습니다.

- [ ] **Step 3: 개발 서버를 다시 띄웁니다**

verify의 빌드 뒤 3301이 옛 CSS를 낼 수 있습니다. 서버를 끄고 `.next/dev`를 지우고 다시 띄운 뒤, 응답한 CSS에 이번에 처음 쓴 클래스(재생 표시의 `rounded-[0.875rem]`)가 있는지 curl로 봅니다. `git status`에 AGENTS.md 변경이 끼지 않았는지 봅니다.

실패를 고친 커밋은 고친 Task의 type과 scope를 따릅니다.

---

### Task 5: 문서

**Files:**
- Modify: `docs/01-prd.md`, `docs/02-ia.md`, `docs/03-design.md`, `docs/guide/CONTENT_AI_사례_20261020.md`, `docs/guide/README.md`
- Create: `docs/design/ai-jake-english/`(캡처 여덟 장), `docs/devlog/2026-11-11-ai-jake-english.md`

- [ ] **Step 1: 캡처를 남깁니다**

Task 4의 캡처에서 만듭니다.
- `entry-1280.png`, `entry-375.png`, `entry-1280-dark.png`, `entry-375-dark.png`: `ai-*` 캡처의 맨 위부터 두 띠 아래까지(`sips -c <높이> <폭> --cropOffset 0 0`)
- `page-1280.png`, `page-375.png`, `page-1280-dark.png`, `page-375-dark.png`: `ai-jake-english-*` 캡처 그대로

- [ ] **Step 2: PRD, IA, 디자인 문서를 고칩니다**

- `docs/01-prd.md` F3: 실을 것에 "Jake English(`/ai` 맨 위 띠와 `/ai/jake-english`)"를 더합니다.
- `docs/02-ia.md`
  - 페이지 표에 `/ai/jake-english` 줄(1차 뒤 추가, 2026-11-11, 헤더 메뉴에 없고 `/ai` 맨 위 띠로 들어감)
  - `/ai` "머리와 목차"의 사례 입구 항목에 두 띠의 배치(데스크톱 나란히, 모바일 사례 먼저)와 비교한 안(위아래 두 가지)
  - 새 절 `### /ai/jake-english Jake English`: `/ai/case` 절과 같은 표(메시지, 사실과 출처, 구성, 움직임)와 항목. 4컷을 C(만화와 연습 흐름 둘 다)로 정한 것과 이유, F3 "항목마다 따로 페이지를 만들지 않는다"의 두 번째 예외인 이유, 메뉴, 돌아가기, 머리, 영상(재생기 없이 유튜브로), 4컷, 본문 다섯 장, 숫자의 기준(날짜 범위로 고정), 끝 링크, 맨 위로 버튼 없음, 검색과 공유. 설계의 「(AI 판단)」 표시를 그대로 옮깁니다.
  - 새 절 `### Jake English 시안`: Step 1의 캡처 표
- `docs/03-design.md`: `## Jake English에서 정한 값`을 `## AI 사례에서 정한 값` 다음에 두고, 입구 띠 둘(배치, 사이, 작은 그림)과 페이지(영상, 재생 표시, 4컷 16:9, 장 머리글과 소제목, 그림, 숫자, 장 사이, 끝 링크)의 값을 모바일과 데스크톱 표로 씁니다. "AI 사례에서 정한 값"의 입구 "배치" 줄은 새 절을 가리키게 고칩니다.

- [ ] **Step 3: 가이드를 고칩니다**

`docs/guide/CONTENT_AI_사례_20261020.md`의 코드, 확인, 캡처 줄에 새 파일을 더하고 `## 영상에서 페이지 만들기 (Jake English, 2026-11-11)`를 더합니다.
- 정한 것: 그림은 공개한 영상에서만 가져오고, 단계와 제목과 말풍선은 HTML로 다시 그린다. 슬라이드 글자는 찍을 때만 바꾸고 원본은 고치지 않는다. 그림 안의 제목 줄은 잘라 페이지 소제목과 겹치지 않게 한다. 4컷은 칸마다 파일 하나(나중에 그림만 바꿀 수 있게). 재생기는 넣지 않고 유튜브로 보낸다. 숫자는 날짜 범위와 함께 고정한 값으로 쓰고, 일부에만 해당하는 문장은 숫자를 넣어 쓴다(78개 중 58개).
- 만드는 방법: Task 1의 표와 명령. 작업 폴더는 "소개 영상을 만든 작업 폴더(이 저장소 밖)"로만 씁니다.
- 겪은 문제와 주의할 점: 구현하며 실제로 겪은 것만 씁니다(없으면 기획에서 겪은 "닷새"와 "엿새"의 날짜 세기만).
- `docs/guide/README.md`의 이 가이드 줄을 고칩니다.

- [ ] **Step 4: devlog를 씁니다**

`docs/devlog/2026-11-11-ai-jake-english.md`를 `docs/devlog/README.md` 양식(한 일, 흐름, 바로잡은 것, 검증, 다음)으로 씁니다. 흐름 표에는 설계의 「(AI 판단)」과 사용자가 고른 것(띠 배치, 4컷 4번 칸, 문구, 숫자 문장)을 AI 제안과 판단으로 나눠 적습니다. 대화 원문은 붙이지 않습니다.

- [ ] **Step 5: 검사와 커밋**

Run: `npm run check:sensitive && perl -CSD -ne 'print "$ARGV:$.: $_" if /[\x{2013}\x{2014}]/; close ARGV if eof' docs/01-prd.md docs/02-ia.md docs/03-design.md docs/guide/*.md docs/devlog/2026-11-11-ai-jake-english.md content/site/jake-english.md`
Expected: 민감정보 검사 통과, perl 출력 없음(em dash와 en dash 없음)

```bash
git add docs/01-prd.md docs/02-ia.md docs/03-design.md docs/design/ai-jake-english docs/guide
git commit -F - <<'EOF'
docs: record the Jake English entry and page in PRD, IA and design

Why the page is the second exception to one page per section, the
layout values, and how the images were made from the intro video.
EOF
git add docs/devlog/2026-11-11-ai-jake-english.md
git commit -F - <<'EOF'
docs(devlog): add the Jake English page log
EOF
```

---

## 끝내기

superpowers finishing-a-development-branch에서 "push하고 PR 열기"를 고릅니다. PR 본문은 CLAUDE.md "브랜치와 PR"의 절을 따르고, 테스트 체크리스트에 배포 뒤 확인할 것(운영의 `/ai/jake-english` 200, 유튜브 링크 클릭이 방문 통계의 `outbound`에 잡힘)을 `[ ]`로 남깁니다. PR 주소를 main 세션에 보냅니다.
