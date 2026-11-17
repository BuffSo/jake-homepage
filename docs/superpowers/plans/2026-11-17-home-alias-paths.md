# 짧은 주소 열 개로도 홈 열기 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `/about`, `/intro`, `/hello`, `/me`, `/profile`, `/welcome`, `/start`, `/info`, `/home`, `/main`이 주소 그대로 홈과 같은 화면을 200으로 돌려주게 합니다.

**Architecture:** 경로 묶음 폴더 `src/app/(home-aliases)/` 아래에 주소마다 정적 페이지를 하나씩 두고, 각 페이지는 홈 페이지 컴포넌트를 그대로 내보냅니다. 메타데이터를 정하지 않아 뿌리 레이아웃의 홈 메타데이터(대표 주소 `/`)를 이어받습니다. 모르는 주소는 지금처럼 빌드 때 만든 404입니다.

**Tech Stack:** Next.js 16 App Router(`cacheComponents: true`, 뿌리 레이아웃 `ensureStatic = "navigation"`), TypeScript, Playwright

**Spec:** `docs/superpowers/specs/2026-11-17-home-alias-paths-design.md`

## Global Constraints

- 주소 열 개는 정확히 `/about` `/intro` `/hello` `/me` `/profile` `/welcome` `/start` `/info` `/home` `/main`입니다. 모두 소문자입니다.
- 다른 주소로 넘기지 않습니다(redirect 없음). `next.config.ts`의 `rewrites`와 `[alias]` 동적 페이지를 쓰지 않습니다.
- 새 페이지는 메타데이터, `generateMetadata`, 경로 설정 값을 내보내지 않습니다.
- 사이트맵(`src/app/sitemap.ts`의 `PATHS`)과 `e2e/seo.spec.ts`의 `PAGES`는 바꾸지 않습니다.
- 공개 글(코드 주석, 문서, 커밋, PR, devlog)에는 동작과 대략의 목적(주소마다 통계가 따로 잡혀 링크를 둔 곳을 나눠 본다)까지만 씁니다. 어느 곳에 어느 주소를 쓰는지는 쓰지 않습니다.
- 공개 글은 합니다체로, em dash와 en dash 없이 씁니다.
- 커밋 메시지는 Conventional Commits 영어, 쌍따옴표 없이, AI 서명 줄 없이 씁니다. `--no-verify`를 쓰지 않습니다.
- 개발 서버는 3301을 씁니다. E2E(포트 3210)와 `npm run verify`(E2E 포함)를 돌리기 전에 main 세션(jake-homepage-1e)에 알립니다. `playwright.config.ts`가 떠 있는 3210 서버를 다시 쓰므로, 다른 카드의 서버가 떠 있으면 그 빌드를 시험하게 됩니다.

## Review Focus

- 끝 슬래시와 쿼리: `/about/`은 Next 기본 동작으로 `/about`으로 넘어가 200이어야 하고, `/about?stats=off`는 경로 그대로 200이어야 합니다. → Task 1 "끝 슬래시와 쿼리가 붙어도 그 주소로 열린다"
- 미리보기·검색 봇: 봇에게는 요청마다 서버에서 새로 그리므로(검색과 공유 가이드의 "봇에게만 홈과 `/ai`가 500"), 봇 User-Agent로도 열 개 모두 200이고 대표 주소가 홈이어야 합니다. → Task 1 "미리보기 봇에게도 열 개 모두 200이고 대표 주소가 홈이다"
- 비슷하지만 정하지 않은 주소: `/About`(대문자), `/about/more`(아래 경로), `/abcd`는 404여야 합니다. → Task 1 "정하지 않은 주소는 404다"
- 짧은 주소에서 사이트 안 이동: 헤더 메뉴로 `/work`에 가면 표시가 Work로 옮겨 가고, "Jake"로 홈에 돌아와야 합니다. → Task 1 "짧은 주소에서 메뉴로 옮겨 다닐 수 있다"
- 폴더와 목록이 어긋남: 폴더를 하나 빼거나 더하면 테스트가 알려야 합니다. → Task 1 "짧은 주소 폴더가 정한 열 개와 같다"

---

### Task 1: 짧은 주소 열 개의 정적 페이지

**Files:**
- Create: `e2e/home-aliases.spec.ts`
- Create: `src/app/(home-aliases)/{about,intro,hello,me,profile,welcome,start,info,home,main}/page.tsx` (10개)
- Modify: `src/app/sitemap.ts:4` (주석 한 줄)

**Interfaces:**
- Consumes: `src/app/page.tsx`의 default export `Home`(인자 없음), `e2e/helpers.ts`의 `collectErrors(page): string[]`
- Produces: 없음

- [ ] **Step 1: E2E 시험 쓰기**

`e2e/home-aliases.spec.ts`. 맨 위 주석에 무엇을 보는지와 설계 문서 경로를 적습니다. 데스크톱에서만 돌립니다(`test.skip(({ hasTouch }) => hasTouch, ...)`, `e2e/seo.spec.ts`와 같음).

```ts
const SITE = "https://jakeso.dev";
const ALIASES = ["/about", "/intro", "/hello", "/me", "/profile", "/welcome", "/start", "/info", "/home", "/main"];
const BOT = "facebookexternalhit/1.1;kakaotalk-scrap/1.0";

/** 홈과 같아야 하는 값: 브라우저 제목, main의 textContent, JSON-LD 글, canonical, og:url, og:image */
async function snapshot(page: Page): Promise<Record<string, string | null>>;
```

시험과 확인할 값:

- `짧은 주소 폴더가 정한 열 개와 같다`: `readdirSync("src/app/(home-aliases)", { withFileTypes: true })`의 폴더 이름에 `/`를 붙여 정렬한 값이 `ALIASES`를 정렬한 값과 같습니다.
- `ALIASES`마다 `${path}는 주소 그대로 홈과 같은 화면을 연다`:
  - `/`를 먼저 열어 `snapshot`을 받고, `collectErrors`를 건 뒤 `path`를 엽니다.
  - `response.status()`가 200, `new URL(page.url()).pathname`이 `path`입니다.
  - `networkidle` 뒤 `errors`가 `[]`입니다.
  - `snapshot(page)`이 홈의 값과 같고(`toEqual`), 홈의 canonical과 og:url은 `SITE`입니다.
  - `page.locator("header [aria-current]")`가 0개입니다.
  - `page.getByRole("link", { name: "다음 페이지: 포트폴리오", exact: true, includeHidden: true })`의 href가 `/work`입니다.
- `끝 슬래시와 쿼리가 붙어도 그 주소로 열린다`: `/about/`을 열면 응답 200, 경로 `/about`. `/about?stats=off`를 열면 응답 200, 경로 `/about`.
- `미리보기 봇에게도 열 개 모두 200이고 대표 주소가 홈이다`: `request.get(path, { headers: { "user-agent": BOT } })`가 200이고, 본문의 canonical 링크가 `https://jakeso.dev`를 가리킵니다(`/<link rel="canonical" href="https:\/\/jakeso\.dev"\s*\/?>/`).
- `정하지 않은 주소는 404다`: `/abcd`, `/About`, `/about/more`에 `request.get`하면 404입니다.
- `짧은 주소에서 메뉴로 옮겨 다닐 수 있다`: `/about`에서 헤더 메뉴의 Work를 누르면 주소가 `/work`이고 Work에 `aria-current="page"`가 붙습니다. 헤더의 Jake를 누르면 주소가 `/`입니다. 그동안 `errors`가 `[]`입니다.

- [ ] **Step 2: 실패하는지 확인**

main 세션에 E2E를 돌린다고 알린 뒤 실행합니다.

Run: `npm run build && npx playwright test e2e/home-aliases.spec.ts --project=desktop`
Expected: 폴더 시험이 ENOENT로, 열 개 주소 시험이 404로 실패합니다. `정하지 않은 주소는 404다`만 통과합니다.

- [ ] **Step 3: 페이지 열 개 만들기**

열 개 폴더의 `page.tsx`를 모두 같은 두 줄로 둡니다(설계 문서의 코드 그대로).

```tsx
// 홈을 짧은 주소로도 연다 (docs/02-ia.md 페이지). 화면, 대표 주소, 공유 정보가 홈과 같다.
export { default } from "../../page";
```

`src/app/sitemap.ts`의 맨 위 주석 첫 줄 뒤에 한 줄을 더합니다: `// 홈의 짧은 주소(src/app/(home-aliases)/)는 대표 주소가 홈이라 넣지 않는다.`

- [ ] **Step 4: 통과하는지 확인**

Run: `npm run typecheck && npm run lint && npm run build`
Expected: 오류 없음. 빌드 출력의 경로 목록에 열 개 주소가 정적(○)으로 나옵니다.

Run: `npx playwright test e2e/home-aliases.spec.ts e2e/seo.spec.ts --project=desktop`
Expected: 모두 통과. `seo.spec.ts`의 사이트맵 시험도 고치지 않은 채 통과합니다.

- [ ] **Step 5: 커밋**

```bash
git add e2e/home-aliases.spec.ts 'src/app/(home-aliases)' src/app/sitemap.ts
git commit -F - <<'EOF'
feat(app): open the home page from ten short paths

Page views are counted per path, so a link placed somewhere can use
its own path and the visits can be told apart. Each path is its own
static page, so the server and the browser read the same pathname
and unknown paths keep the build-time 404.
EOF
```

### Task 2: PRD, IA, 가이드

**Files:**
- Modify: `docs/01-prd.md:46` 뒤
- Modify: `docs/02-ia.md:14` 뒤 (페이지 표의 `/resume` 줄)
- Modify: `docs/guide/SEO_검색과_공유_정책_20261017.md` (머리의 코드·확인 줄, "페이지를 더할 때" 뒤에 새 절)
- Modify: `docs/guide/ANALYTICS_방문_통계_20261024.md` ("만드는 방법"의 컴포넌트 항목 뒤)
- Modify: `docs/guide/README.md` (두 가이드의 설명 칸)

**Interfaces:**
- Consumes: Task 1의 폴더 경로 `src/app/(home-aliases)/`와 시험 파일 `e2e/home-aliases.spec.ts`
- Produces: 없음

- [ ] **Step 1: PRD 문단 넣기**

`docs/01-prd.md`의 방문 통계 문단(46줄) 뒤에 빈 줄을 두고 아래 문단을 글자 그대로 넣습니다.

```md
홈을 짧은 주소 열 개(`/about`, `/intro`, `/hello`, `/me`, `/profile`, `/welcome`, `/start`, `/info`, `/home`, `/main`)로도 연다. 어느 주소로 열어도 홈과 같은 화면이 나오고 주소창은 그대로다. 방문 통계에는 주소마다 따로 잡혀, 링크를 둔 곳마다 다른 주소를 쓰면 어디서 들어왔는지 나눠 볼 수 있다. 대표 주소는 홈이고 사이트맵에는 넣지 않는다. 1차를 배포한 뒤 더한 요청이다(2026-11-17).
```

- [ ] **Step 2: IA 페이지 표에 줄 더하기**

`docs/02-ia.md` 페이지 표의 `/resume` 줄(14줄) 뒤에 넣습니다.

```md
| `/about`, `/intro`, `/hello`, `/me`, `/profile`, `/welcome`, `/start`, `/info`, `/home`, `/main` | 홈과 같은 화면. 주소창은 그 주소 그대로이고 방문 통계에는 주소마다 따로 잡힙니다. 대표 주소는 홈이고 사이트맵과 헤더 메뉴에는 없습니다 | 1차 뒤 추가 (2026-11-17) |
```

- [ ] **Step 3: 검색과 공유 가이드에 절 더하기**

- 머리의 `> 코드:` 줄에 `src/app/(home-aliases)/`를, `> 확인:` 줄에 `e2e/home-aliases.spec.ts`를 더합니다.
- "페이지를 더할 때" 절 뒤에 `## 같은 화면을 다른 주소로도 열 때` 절을 둡니다. 담을 내용(합니다체 항목):
  - 정한 것: 대표 주소는 원래 페이지, 사이트맵에 넣지 않음, 메타데이터를 정하지 않아 원래 페이지의 것을 이어받음, `noindex`를 달지 않음(대표 주소와 함께 달면 신호가 엇갈림), 넘기지 않아 주소창이 그대로임. 2026-11-17 홈의 짧은 주소 열 개가 처음입니다.
  - 만드는 방법: 경로 묶음 폴더 아래에 주소마다 `page.tsx`를 두고 원래 페이지를 `export { default } from`으로 내보냄. 같은 주소의 페이지를 또 만들면 빌드가 실패함.
  - 쓰지 않은 방법과 이유: `rewrites`는 서버가 그린 경로와 브라우저 경로가 달라 `usePathname()`을 읽는 곳(헤더 메뉴)에서 수화 오류가 날 수 있음(Next `usePathname` 문서). `[alias]` 동적 페이지는 `cacheComponents`에서 `dynamicParams`를 쓸 수 없어, 모르는 한 단계 주소가 첫 요청 때 서버에서 그려진 뒤 404가 됨(`dynamicParams.md`).
  - 확인 방법: `e2e/home-aliases.spec.ts`가 보는 것(200과 주소 그대로, 홈과 같은 글과 공유 정보, 봇 User-Agent 200, 모르는 주소 404)을 한 줄로.

- [ ] **Step 4: 방문 통계 가이드에 항목 더하기**

"만드는 방법"의 컴포넌트 항목 뒤에 `**어느 경로로 잡히는지**` 항목을 둡니다. 담을 내용:
  - `@vercel/analytics/next`는 `usePathname()`을 `path`로, 경로 규칙(`/work`, 동적 페이지라면 `/[slug]`)을 `route`로 보냄. 통계 스크립트는 `path`로 보낼 주소의 경로를 바꿈. 2026-11-17 패키지 2.0.1 코드와 운영 스크립트를 읽어 확인함.
  - 그래서 같은 화면을 여는 정적 페이지 여러 개는 `path`와 `route` 모두 주소마다 따로 잡힘. 바깥 링크 클릭의 누른 페이지도 `location.pathname`이라 같음.
  - 운영 확인은 배포 뒤 일반 브라우저로 한 주소를 열고 경로별 숫자를 봄(자동화 브라우저는 집계되지 않음, 아래 절).

- [ ] **Step 5: 가이드 색인 고치기**

`docs/guide/README.md` 표에서 검색과 공유 가이드 설명에 "같은 화면을 다른 주소로도 열 때"를, 방문 통계 가이드 설명에 "어느 경로로 잡히는지"를 더합니다.

- [ ] **Step 6: 확인과 커밋**

Run: `npm run check:sensitive`, 그리고 고친 다섯 파일에 U+2013, U+2014가 없는지 확인
Expected: 통과, 0개

```bash
git add docs/01-prd.md docs/02-ia.md docs/guide
git commit -F - <<'EOF'
docs: record the short home paths in the PRD, IA and guides
EOF
```

### Task 3: 검증, devlog, PR

**Files:**
- Create: `docs/devlog/2026-11-17-home-alias-paths.md`

**Interfaces:**
- Consumes: Task 1, 2의 커밋
- Produces: PR 주소(main 세션에 보냄)

- [ ] **Step 1: 전체 검사**

main 세션에 E2E를 포함한 검사를 돌린다고 알린 뒤 실행합니다.

Run: `npm run verify`
Expected: 요약 표의 모든 검사가 통과이거나, 로컬 전용 검사만 건너뜀. 실패하면 요약 표와 실패 내용을 그대로 main 세션에 보냅니다. 끝나면 3301 개발 서버를 띄웠다면 다시 띄웁니다.

- [ ] **Step 2: devlog 쓰기**

`docs/devlog/README.md`의 양식(한 일, 흐름 표, 바로잡은 것, 검증, 다음)을 따릅니다. 흐름 표에는 다음을 씁니다.
  - AI 제안(main 세션): `[alias]` 페이지와 `dynamicParams = false`. 판단: 설계에서 문서를 확인하니 `cacheComponents`에서는 쓸 수 없음. 결과: 세 방법(rewrites, `[alias]` + `notFound()`, 정적 페이지 열 개)을 비교함.
  - AI 제안: 정적 페이지 열 개. 판단: 사용자가 골랐음. 결과: 서버와 브라우저 경로가 같고 모르는 주소는 지금 404 그대로임.
  - AI 판단을 사용자가 그대로 승인한 것: 괄호 폴더, `noindex` 없음, 데스크톱 전용 E2E.
- 검증에는 Step 1의 결과를 짧게 쓰고, "다음"에는 배포 뒤 운영에서 경로별 집계를 확인할 일을 씁니다.

```bash
git add docs/devlog/2026-11-17-home-alias-paths.md
git commit -F - <<'EOF'
docs(devlog): record the short home paths
EOF
```

- [ ] **Step 3: 푸시하고 PR 열기**

Run: `git push -u origin feat/home-alias-paths`, 그다음 `git rev-parse HEAD`와 `git rev-parse origin/feat/home-alias-paths`가 같은지 봅니다.

`gh pr create`로 PR을 엽니다. 제목은 `feat(app): open the home page from ten short paths`입니다. 본문은 CLAUDE.md의 절(요약, 배경, 한계, 테스트 체크리스트)을 따릅니다.
  - 한계: 주소는 소문자만 열림(`/About`은 404). 방문 통계는 운영에서만 확인할 수 있음.
  - 테스트 체크리스트의 `[ ]`: 배포 뒤 일반 브라우저로 한 주소를 열어 경로별로 잡히는지 확인, 봇 User-Agent로 운영 주소 200 확인.

PR 주소를 main 세션에 보냅니다.
