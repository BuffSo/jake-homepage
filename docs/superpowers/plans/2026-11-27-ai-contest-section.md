# `/ai` 다섯째 묶음 "대회 참가" 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `/ai` 맨 끝에 다섯째 묶음 "대회 참가"를 더하고 AX인재전쟁 카드 하나를 두어 `/ai/axwar`로 보내며, `/ai/axwar` 끝 줄의 인증서 버튼을 되살리고, PR #69의 후속 작업 네 가지를 함께 끝냅니다.

**Architecture:** 다른 항목처럼 항목 글 `content/site/ai/axwar.md`(짧은 카드, `group: contest`)를 더하고 `ai-page.md`에 묶음을 더하면 지금 `/ai` 코드가 그대로 그립니다. 바뀌는 코드는 목차의 데스크톱 칸 수(네 칸 → 다섯 칸)와 형(`AiGroup`)뿐입니다. 카드의 숫자와 문장이 `/ai/axwar` 글과 어긋나지 않는지는 내용 시험이 봅니다.

**Tech Stack:** Next.js 16 App Router, TypeScript, Tailwind CSS 4, Playwright, node --test

**Spec:** `docs/superpowers/specs/2026-11-27-ai-contest-section-design.md`

## Global Constraints

- 묶음: id `contest`, 이름 `대회 참가`, 맨 끝(`05 / 05`).
- 카드: slug `axwar`, order `10`, 짧은 카드(`more: /ai/axwar`), `links: []`. 글은 설계 문서 "카드" 표의 초안 그대로입니다. 문구 확인은 PR 때 따로 받습니다.
- 카드에 새 사실을 쓰지 않습니다. 대회 기간("하루 남짓", "이틀", "N일", "N시간")도 쓰지 않습니다.
- 홈과 `/resume`의 띠, `/ai` 맨 위 입구 상자 두 개는 바꾸지 않습니다. `/ai/axwar`는 끝 버튼 줄만 바꿉니다(Task 2). 머리와 인증서 카드는 그대로입니다.
- `/ai/axwar` 끝 버튼 줄: `인증서 보기`(채운 버튼, `cert.cta`, 새 창, ↗) + `AI로 일하는 방식`(테두리 버튼, `/ai`). 카드 근처에는 버튼을 더하지 않습니다.
- 색과 길이: 새 값이 없습니다. 쓰는 값은 rem과 Tailwind 기본 유틸리티입니다(`npm run check:units`).
- 공개 글(주석, 문서, 커밋, PR, devlog)은 합니다체, em dash와 en dash 없이 씁니다. AI 활용은 본인이 주어인 능동 표현으로 씁니다.
- 커밋 메시지는 Conventional Commits 영어, 쌍따옴표 없이, AI 서명 줄 없이 씁니다(`git commit -F - <<'EOF'`). `--no-verify`를 쓰지 않습니다. 한 커밋에 type 하나입니다. 커밋 전에 `git diff --cached`를 봅니다.
- 개발 서버는 3301입니다(`rtk proxy npx next dev --port 3301`). 지금 홈페이지 카드는 이 카드 하나라 `npm run verify`(E2E 포트 3210)는 묻지 않고 돌립니다.
- todo `docs/todo/20261127_01_todo_axwar_followups.md`는 Task 5의 커밋까지 untracked로 두고, 그 커밋에서 상태 줄을 완료로 고쳐 넣습니다.

## 개발 중 E2E를 돌리는 방법

빨강·초록 확인은 개발 서버(3301)에 대고 돌립니다. git에서 빠진 `.superpowers/`에 설정을 하나 둡니다(커밋하지 않음).

```ts
// .superpowers/pw-dev.config.ts
import base from "../playwright.config";
export default { ...base, testDir: "../e2e", use: { ...base.use, baseURL: "http://127.0.0.1:3301" }, webServer: undefined };
```

Run: `npx playwright test -c .superpowers/pw-dev.config.ts <spec> [-g <이름>]`

"콘솔 오류와 실패한 요청이 없다" 시험은 개발 서버에서 믿지 않고 마지막 `npm run verify`에서 봅니다.

## Review Focus

- 가장 좁은 데스크톱 폭(1024)에서 목차 다섯 칸이 한 줄에 있고, "대회 참가"가 꺾이지 않아야 합니다(사용자 조건). → Task 1의 목차 E2E
- 카드의 "자세히 보기"는 사이트 안 링크라 같은 창에서 열리고 ↗가 없어야 합니다. → Task 1의 짧은 카드 E2E
- `/ai/axwar` 글의 결과나 참가자 수가 바뀌면 카드 숫자도 같이 바뀌어야 합니다. → Task 1의 내용 시험
- 375와 320에서 카드가 가로 스크롤을 만들지 않아야 합니다. → `e2e/ai.spec.ts`의 기존 가로 스크롤 시험(지금 폭)
- `/ai/axwar`의 인증서 링크가 둘(카드, 끝 버튼)이 되어도 카드 시험이 카드만 잡아야 합니다. → Task 2의 `certCard` 좁히기
- 맨 끝 묶음이 바뀐 뒤에도 페이지 끝의 다음 페이지 버튼과 맨 위로 버튼이 그대로 나와야 합니다. → `e2e/back-to-top.spec.ts`의 `/ai` 시험(기존)

---

### Task 1: 묶음과 카드

**Files:**
- Create: `content/site/ai/axwar.md`
- Modify: `content/site/ai-page.md` (groups 끝에 `contest`, 주석)
- Modify: `src/lib/content.ts` (`AiGroup`에 `"contest"`)
- Modify: `src/components/ai/ai-index.tsx` (`lg:grid-cols-4` → `lg:grid-cols-5`, 주석의 "네 칸")
- Modify: `src/components/ai/ai-short.tsx` (주석: 원문이 다른 페이지, `/work`의 절이나 `/ai` 아래 페이지에 있는 항목)
- Modify: `src/app/ai/page.tsx` (주석의 "네 묶음")
- Modify: `src/app/ai/axwar/page.tsx` (주석 "/ai에는 입구가 없다" → `/ai` 맨 끝 대회 참가 카드도 이 페이지로 온다)
- Modify: `content/site/axwar.md` (주석의 들어오는 길에 `/ai` 카드)
- Test: `scripts/lib/content.test.mjs`, `e2e/ai.spec.ts`

**Interfaces:**
- Produces: 항목 글 `content/site/ai/axwar.md`의 머리말 `slug, order, group, eyebrow, title, problem, built, result, metric{value,label}, links, more, sources`. `sources`는 `/ai/axwar` 본문에 그대로 있는 조각입니다(예: `부서마다 다른 숫자로 판단해 결정이 늦어지는`, `판단부터 승인과 처리까지 실제로 이어지는 AI 운영 시스템`, `Orca로 기능을 나눠 git worktree 여러 개에서 동시에 개발했습니다`).

- [ ] **Step 1: 내용 시험 고치기** (`scripts/lib/content.test.mjs`)
  - 맨 위에서 `const axwar = read("content/site/axwar.md");`를 읽습니다.
  - "sources의 문장은 …" 시험: 항목의 `more`가 `/ai/axwar`이면 원문 대신 `squash(axwar.body.join(" "))`에서 찾습니다. 시험 이름은 "sources의 문장은 원문(동기화한 이력서, 포트폴리오, 카드가 가리키는 페이지 글)에 그대로 있다"로 바꿉니다.
  - "AI 작업 글 …" 시험: `more`는 `/^(\/work#[a-z-]+-ai|\/ai\/[a-z-]+)$/`에 맞아야 합니다.
  - "짧은 카드가 가리키는 /work의 절은 실제로 있다" → "짧은 카드가 가리키는 곳은 실제로 있다": `/work#…`는 지금처럼 절을, `/ai/<이름>`은 `src/app/ai/<이름>/page.tsx`가 있는지 봅니다.
  - 새 시험 "대회 참가 카드는 /ai/axwar로 가고, 숫자는 그 페이지 글과 같다":

```js
const card = aiWorks.find((w) => w.data.group === "contest" && w.data.more === "/ai/axwar");
assert.ok(card, "대회 참가에 /ai/axwar 카드가 없음");
assert.equal(card.data.metric.value, axwar.result);
assert.equal(card.data.metric.label, `${axwar.participants} · ${axwar.date}`);
assert.ok(card.data.sources?.length > 0, "sources 없음");
// 띠와 같은 까닭으로 기간을 쓰지 않는다(이력서의 이틀 만에, /ai/axwar의 하루 남짓)
assert.doesNotMatch(Object.values(card.data).filter((v) => typeof v === "string").join(" "), /이틀|하루|\d+\s*(일|시간)/);
```

- [ ] **Step 2: E2E 고치기** (`e2e/ai.spec.ts`)
  - "짧은 카드는 /work의 AI 절로 보낸다" → "짧은 카드는 원문이 있는 곳으로 보낸다": `more`에 `#`이 있으면 지금처럼 그 절이 보이는지, 없으면 `toHaveURL(new RegExp(`${more}$`))`와 h1이 보이는지 봅니다. 사이트 안 주소이므로 클릭 전에 `target`이 `_blank`가 아니고 링크 이름에 ↗가 없는지 봅니다.
  - 새 시험 "데스크톱 목차는 묶음이 한 줄에 나란히 있고, 묶음 이름이 꺾이지 않는다": 모바일은 건너뜁니다. 폭 1024와 1280(높이 800)마다 `#page-index > ul > li`의 위가 모두 첫 칸과 1px 안이고, 칸마다 묶음 링크(`li > div > a`)의 높이가 첫 칸 묶음 링크와 1px 안입니다.

- [ ] **Step 3: 빨강 확인**

Run: `node --test scripts/lib/content.test.mjs`
Expected: "대회 참가 카드는 …" 실패(카드 없음)

- [ ] **Step 4: 시험 커밋**

```bash
git add scripts/lib/content.test.mjs e2e/ai.spec.ts
git commit -F - <<'EOF'
test(app): cover the contest section on /ai
EOF
```

- [ ] **Step 5: 글 더하기** `content/site/ai-page.md`의 groups 끝에 `{ id: contest, title: 대회 참가 }`, `content/site/ai/axwar.md`는 설계 문서 "카드" 표의 초안과 `sources`. 글 끝 주석에 출처(`content/site/axwar.md`의 어느 칸과 문단인지), 숫자는 내용 시험이 페이지 글과 맞춰 본다는 것, 기간을 쓰지 않는 이유, 대회가 늘면 이 묶음에 글을 하나씩 더한다는 것을 씁니다.

- [ ] **Step 6: 목차가 꺾이는 것 확인 (빨강)**

Run: `node --test scripts/lib/content.test.mjs` 뒤 `npx playwright test -c .superpowers/pw-dev.config.ts ai.spec.ts -g "목차"`
Expected: 내용 시험 통과. 데스크톱 목차 시험은 다섯째 칸이 둘째 줄로 내려가 실패

- [ ] **Step 7: 코드 고치기** `AiGroup = "dev" | "product" | "beyond" | "personal" | "contest"`, 목차 `lg:grid-cols-5`, 위 Files의 주석들.

- [ ] **Step 8: 초록 확인**

Run: `npx playwright test -c .superpowers/pw-dev.config.ts ai.spec.ts back-to-top.spec.ts`, `npm run typecheck`, `npm run lint`, `npm run check:units`
Expected: "콘솔 오류" 시험을 뺀 모두 통과

- [ ] **Step 9: 커밋**

```bash
git add content/site/ai-page.md content/site/ai/axwar.md content/site/axwar.md src/lib/content.ts src/components/ai/ai-index.tsx src/components/ai/ai-short.tsx src/app/ai/page.tsx src/app/ai/axwar/page.tsx
git commit -F - <<'EOF'
feat(app): add the contest result section to /ai
EOF
```

### Task 2: `/ai/axwar` 끝 버튼 되살리기

**Files:**
- Modify: `content/site/axwar.md` (`cert.cta: 인증서 보기`, 주석의 cert 설명)
- Modify: `src/lib/content.ts` (`Axwar.cert`에 `cta: string`)
- Modify: `src/app/ai/axwar/page.tsx` (끝 줄과 머리 주석)
- Test: `e2e/ai-axwar.spec.ts`
- Modify: `docs/02-ia.md` (`/ai/axwar` 절의 구성, 인증서 카드 항목, 끝 링크), `docs/03-design.md` (AX인재전쟁 절의 끝 버튼 줄 문장 두 곳)
- Modify: `docs/design/ai-axwar/page-1280.png`, `page-375.png`, `page-1280-dark.png`, `page-375-dark.png`

**Interfaces:**
- Produces: `Axwar.cert = { href: string; title: string; domain: string; cta: string }`

- [ ] **Step 1: E2E 고치기**
  - `certCard`를 `` page.locator("main").locator(`a[href="${ax.cert.href}"]:has(img)`) ``로 좁힙니다(같은 주소의 링크가 둘이 됨).
  - "돌아가기 링크와 끝 버튼은 /ai로 가고, 인증서로 가는 링크는 카드 하나뿐이다" → "돌아가기 링크는 /ai로, 끝 줄은 인증서 보기와 AI로 일하는 방식이다": main 링크의 href가 `["/ai", ax.cert.href, ax.cert.href, "/ai"]`이고, 끝 인증서 버튼(`getByRole("link", { name: new RegExp(ax.cert.cta) })`)은 `target="_blank"`이며 본문 마지막 문단보다 아래에 있습니다.

- [ ] **Step 2: 빨강 확인**

Run: `npx playwright test -c .superpowers/pw-dev.config.ts ai-axwar.spec.ts`
Expected: 끝 줄 시험 실패(링크 셋), 다른 시험 통과

- [ ] **Step 3: 시험 커밋**

```bash
git add e2e/ai-axwar.spec.ts
git commit -F - <<'EOF'
test(app): expect the certificate button at the end of /ai/axwar
EOF
```

- [ ] **Step 4: 구현** 끝 줄을 `<ButtonLink href={ax.cert.href} variant="solid">{ax.cert.cta}</ButtonLink>` 다음에 지금의 `/ai` 버튼으로 둡니다(PR #69 처음 구현 `63734f6`의 짜임). 주석의 "인증서는 머리 아래 카드 하나로만 간다"를 고칩니다.

- [ ] **Step 5: 초록 확인과 커밋**

Run: `npx playwright test -c .superpowers/pw-dev.config.ts ai-axwar.spec.ts`, `npm run typecheck`
Expected: "콘솔 오류" 시험을 뺀 모두 통과

```bash
git add content/site/axwar.md src/lib/content.ts src/app/ai/axwar/page.tsx
git commit -F - <<'EOF'
feat(app): bring back the certificate button at the end of /ai/axwar
EOF
```

- [ ] **Step 6: 문서와 캡처** 페이지 캡처 네 장을 개발 서버에서 1배 전체 화면으로 다시 찍고, IA와 디자인 문서의 끝 버튼 서술을 고칩니다(같은 날 사용자 요청으로 되살림, 카드 근처에는 두지 않음).

```bash
git add docs/02-ia.md docs/03-design.md docs/design/ai-axwar
git commit -F - <<'EOF'
docs: record the restored certificate button on /ai/axwar
EOF
```

### Task 3: 띠의 기간 시험 넓히기 (후속 1)

**Files:**
- Test: `scripts/lib/content.test.mjs` (시험 "대회 결과 띠는 /ai/axwar로 가고, 둘째 줄에 기간을 쓰지 않는다")

- [ ] **Step 1: 시험 고치기** 이름을 "대회 결과 띠는 /ai/axwar로 가고, 두 줄 모두 기간을 쓰지 않는다"로, 검사를 `` assert.doesNotMatch(`${award.title} ${award.detail}`, /이틀|하루|\d+\s*(일|시간)/) ``로 바꿉니다. 주석에 숫자로 쓴 기간("2일 만에", "31시간 만에")도 막는다고 씁니다.

- [ ] **Step 2: 잡는지 확인**

Run: `node -e 'const r=/이틀|하루|\d+\s*(일|시간)/;for(const s of ["2일 만에","31시간 만에","이틀 만에","하루 남짓"])if(!r.test(s))process.exit(1);if(r.test("AI 실력을 겨루는 AX인재전쟁 대회 상위 5% 성적 삼일PwC 출제 과제 · AI 운영 시스템 구현 · 참가자 2,916명 중 · 2026.11"))process.exit(1)' && node --test scripts/lib/content.test.mjs`
Expected: 종료 코드 0, 시험 통과

- [ ] **Step 3: 커밋**

```bash
git add scripts/lib/content.test.mjs
git commit -F - <<'EOF'
test: catch period words in both award band lines
EOF
```

### Task 4: 문서, 캡처, 주석

**Files:**
- Modify: `src/lib/content.ts` (`Axwar.extra` 주석 "참가자 줄 아래의 덧붙임 한 줄" → "인증서 카드 아래의 덧붙임 한 줄")
- Modify: `docs/01-prd.md` (F3)
- Modify: `docs/02-ia.md` (페이지 표 `/ai`, `/ai/axwar` 행 / 홈 3 띠 행 / `/ai` 절 / `/ai/axwar` 절의 들어오는 길 / 새 캡처 표)
- Modify: `docs/03-design.md` (F3의 목차 문장)
- Modify: `docs/superpowers/specs/2026-11-27-ai-axwar-design.md` ("하지 않을 것"의 `/ai` 입구 줄에 같은 날 뒤집었다는 한 줄과 새 설계 링크)
- Create: `docs/design/ai-contest/`

- [ ] **Step 1: 주석 커밋**

```bash
git add src/lib/content.ts
git commit -F - <<'EOF'
docs: point the reward note comment at its place below the card
EOF
```

- [ ] **Step 2: 캡처** 비교판 그림(작업 폴더 밖 임시 폴더)을 1배로 줄여 `board-now-*`, `board-ga-*`, `board-na-*`(1280, 375), `board-index-now-*`, `board-index-five-*`(1280, 375, 1024)로 옮깁니다. 구현 캡처는 개발 서버에서 같은 스크립트 방식으로 찍습니다: `after-1280`, `after-375`, `after-1280-dark`, `after-375-dark`(넷째 묶음 끝부터 푸터까지), `index-1280`, `index-1024`, `index-375`. 한 장이 1MB를 넘지 않게 합니다.

- [ ] **Step 3: 문서 고치기** 설계 문서 "함께 고칠 문서"를 따릅니다. 뒤집은 결정은 날짜(2026-11-27)와 이유(상세 페이지가 `/ai` 아래 생겨 헤더의 AI 밑줄과 `/ai` 페이지가 어긋남, 사용자)를 적고, 옛 문장은 "처음에는 …"으로 남깁니다. IA `/ai` 절의 묶음 표에 `대회 참가 | AX인재전쟁 삼일PwC 과제(axwar) | 짧은 카드, /ai/axwar로` 행을 더하고, "짧은 카드" 설명에 `/ai` 아래 페이지로 가는 경우를 더합니다. 비교한 안(가, 나, 이름 세 안과 고른 이름, 1024 확인값)과 AI 판단 표시를 씁니다.

- [ ] **Step 4: 확인과 커밋**

Run: `npm run check:sensitive`, `grep -o 'design/ai-contest/[^)]*' docs/*.md | sort -u`로 뽑은 그림이 모두 있는지 `ls`
Expected: 통과, 빠진 파일 없음

```bash
git add docs/01-prd.md docs/02-ia.md docs/03-design.md docs/superpowers/specs/2026-11-27-ai-axwar-design.md docs/design/ai-contest
git commit -F - <<'EOF'
docs: record the contest section on /ai
EOF
```

### Task 5: 가이드 교훈과 첫 화면 여유 (후속 2, 3)

**Files:**
- Modify: `docs/guide/SEO_검색과_공유_정책_20261017.md` ("페이지를 더할 때" 5번, 머리의 확인 줄)
- Modify: `docs/guide/CONTENT_AI_사례_20261020.md` (새 절 "바깥 증빙을 링크 카드로 보여 줄 때 (AX인재전쟁, 2026-11-27)", 머리의 정함·코드·확인·캡처 줄)
- Modify: `docs/guide/README.md` (두 가이드 줄)
- Modify: `docs/03-design.md` (AX인재전쟁 절의 첫 화면 여유 한 줄)
- Modify: `docs/todo/20261127_01_todo_axwar_followups.md` (상태 줄)

- [ ] **Step 1: 가이드 쓰기**
  - SEO 5번: 새 페이지의 E2E는 응답이 200인지 먼저 봅니다. 이유: `/ai/axwar`를 만들 때 가로 스크롤 시험과 캡처 시험이 페이지가 없을 때(404 화면)도 통과했습니다. 확인 방법: 새 페이지 시험 파일의 첫 시험이 `page.goto` 응답의 `status()`를 200과 견주는지 봅니다(`e2e/ai-axwar.spec.ts` 예).
  - AI 사례 가이드 새 절: 정한 것(그림은 그 페이지의 공유 그림 og:image를 받아 저장소에 둠, 카드 제목은 이름 없는 그림 설명 og:image:alt, 카드 전체가 링크 하나이고 새 창, 그림 대체 텍스트는 비움), 이유(대회 측이 비공개로 돌리거나 주소를 바꿔도 깨지지 않음, og:title은 이름에 님을 붙인 3인칭), 만드는 방법(페이지 머리의 og:image, og:image:alt 읽기, 받은 날짜를 글 주석에), 코드와 확인(`content/site/axwar.md`의 `cert`, `src/app/ai/axwar/page.tsx`, `e2e/ai-axwar.spec.ts`의 인증서 카드 시험).
- [ ] **Step 2: 첫 화면 여유 한 줄** 03-design.md AX인재전쟁 절의 첫 화면 문단 뒤에: 1366×768 노트북(쓸 수 있는 높이 약 650px)과 메신저 안 375×667(약 550px)에서는 지금도 카드 제목이 첫 화면 아래로 잘리고 그림 윗부분만 보입니다. 지금 기준(1280×800, 375×812)으로는 문제가 아니고, 카드 위에 무엇을 더할 때 이 여유를 먼저 봅니다.
- [ ] **Step 3: todo 상태 줄** `> 상태: **완료** (2026-11-27, 이 PR). 1번은 띠 두 줄을 함께 보는 시험으로, 2번은 두 가이드에, 3번은 고칠 것이 없어 03-design.md에 기준 한 줄만 남겼습니다(이 PR은 /ai/axwar 머리를 바꾸지 않음).`
- [ ] **Step 4: 확인과 커밋**

Run: `npm run check:sensitive`
Expected: 통과

```bash
git add docs/guide docs/03-design.md docs/todo/20261127_01_todo_axwar_followups.md
git commit -F - <<'EOF'
docs: add guide notes from the /ai/axwar page
EOF
```

### Task 6: 검증, devlog, PR

- [ ] **Step 1: 검증**

Run: `npm run verify`
Expected: 로컬 전용 검사 두 개(`sync --check`, `check:stack`)를 뺀 모든 줄 통과. 그 둘은 main에서도 나는 기존 실패입니다. 다른 실패가 있으면 요약 표와 실패 내용을 그대로 보고합니다. 끝나면 개발 서버를 다시 띄우고(`.next/dev` 지움) `/ai`의 CSS에 `grid-cols-5`가 있는지 봅니다.

- [ ] **Step 2: devlog** `docs/devlog/2026-11-27-ai-contest-section.md` (`docs/devlog/README.md` 형식). 흐름 표: 띠를 `/ai`에 싣지 않던 결정을 뒤집음(사용자 지적), 모양 가(main 세션 추천, 승인), 이름(AI 추천 "대회 결과" → 사용자가 다른 대회도 담게 "대회 참가"), 목차 다섯 칸(AI 판단), `/ai/axwar` 끝 인증서 버튼 되살림(사용자 요청). 검증에 verify 결과.

```bash
git add docs/devlog/2026-11-27-ai-contest-section.md
git commit -F - <<'EOF'
docs(devlog): add the /ai contest section log
EOF
```

- [ ] **Step 3: 푸시와 PR** `git push -u origin feat/ai-award-section`, `git rev-parse HEAD`와 `git rev-parse origin/feat/ai-award-section`를 견줍니다. `gh pr create` 제목 `feat(app): add the contest result section to /ai`, 본문 한국어 합니다체로 `## 요약`, `## 배경`, `## 한계`(로컬 전용 검사 두 개의 기존 실패, 상세 페이지 없는 대회 카드는 그때 정함), `## 테스트 체크리스트`(verify 요약 표). AI 서명 줄을 넣지 않습니다.

- [ ] **Step 4: main 세션에 한 번 알리기** (SendMessage `jake-homepage-48`): PR 주소, 구현 캡처(05 묶음, 목차, `/ai/axwar` 끝 줄)를 띄운 확인판 주소, 카드 문구 확인 표(칸마다 초안과 다른 안 한두 개, 추천), 리뷰 제안. 문구를 고치라는 답이 오면 같은 PR에 커밋을 더합니다.
