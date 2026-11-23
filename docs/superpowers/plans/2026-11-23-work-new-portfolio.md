# /work를 새 포트폴리오 원본에 맞추기 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 새 포트폴리오 원본을 동기화하고, `/work`가 구성도와 Jake English 챕터를 포함해 지금 모양 그대로 그려지게 합니다.

**Architecture:** 원본에서 빠진 상세는 동기화 규칙(`insert-before`)으로 `content/synced/portfolio.md`에 넣습니다. `src/lib/portfolio.mjs`가 새 형식(굵지 않은 기간 줄, 주소 여럿, 1절 HTML 표)을 읽어 챕터를 만들고, `content/site/work.md`가 챕터마다 본문 절과 뒤에 붙일 절을 정합니다. 그림은 rehype 플러그인이 상자로 감싸고 `globals.css`가 모양을 줍니다.

**Tech Stack:** Next.js 16 App Router, TypeScript, Tailwind CSS 4, react-markdown(remark, rehype), node --test, Playwright.

**Spec:** `docs/superpowers/specs/2026-11-23-work-new-portfolio-design.md`

## Global Constraints

- `content/synced/`는 손으로 고치지 않습니다. `npm run sync`로만 만듭니다(기준: 원본 저장소의 지금 커밋).
- 원본 저장소의 파일은 고치지 않습니다. 읽는 것은 허용 목록(`scripts/sync.config.mjs`)의 파일과 그 파일의 이력뿐입니다.
- 원문 문장은 다시 쓰지 않습니다(ADR-0003). 사이트에만 남기는 블록도 지우기 전의 원문 그대로입니다.
- 앵커 `/work#recueve`, `/work#prowith`, `/work#lotto-ai`, `/work#prowith-ai`, `/work#recueve-ai`는 그대로 동작해야 합니다.
- 길이 단위는 rem입니다(`npm run check:units`). 테두리 두께는 Tailwind 기본 유틸리티만 씁니다.
- 공개 글(문서, 커밋, PR)에 `CLAUDE.local.md`와 `docs/private/`의 내용을 옮기지 않습니다. 「인쇄본」이라고 씁니다.
- 커밋 메시지는 Conventional Commits 영어, 쌍따옴표 없이, AI 서명 없이 씁니다.
- 개발 서버는 3301을 씁니다. E2E(3210)는 돌리기 전에 main 세션에 차례를 묻습니다.
- 지금 작업 폴더에는 비교판용 시안 코드가 커밋되지 않은 채 있습니다. 각 태스크는 시안을 출발점으로 쓰되, 시험을 먼저 쓰고 이 계획의 이름과 형에 맞춥니다. `content/synced/portfolio.md`의 시안 사본은 태스크 1의 동기화가 덮어씁니다.

## Review Focus

1. 원본이 다시 바뀌어 끼울 자리의 제목이 없어지거나 블록 첫 줄이 원본에 돌아왔을 때: 동기화가 멈추고 무엇이 어긋났는지 말해야 합니다(태스크 1).
2. 주소 줄의 모양이 다를 때(괄호 없는 주소 둘, 굵은 기간, 주소 없음): 읽기가 멈춰야 합니다(태스크 2).
3. 1절 표에 프로젝트 줄이 없거나 이름이 둘 이상 맞을 때: 멈춰야 합니다(태스크 2).
4. 375 화면에서 그림이 페이지를 옆으로 밀 때: 페이지에는 가로 스크롤이 없고 그림 상자만 넘겨야 합니다(태스크 4, 5).
5. `/resume`이 새 이력서의 「🔗 이름 주소」 줄과 원본 맨 위 `<style>`을 만났을 때: 링크가 보이고 인쇄용 규칙이 들어오지 않아야 합니다(태스크 4, 6).

---

### Task 1: 동기화 규칙과 동기화

**Files:**
- Modify: `scripts/sync.config.mjs` (포트폴리오 `transforms`)
- Modify: `scripts/lib/sync.test.mjs`
- Regenerate: `content/synced/portfolio.md`, `content/synced/resume.md`

**Interfaces:**
- Produces: `content/synced/portfolio.md`에 아래 세 블록이 든 새 원본. 뒤 태스크의 시험이 이 파일을 읽습니다.

- [ ] **Step 1: 시험을 먼저 씁니다** (`scripts/lib/sync.test.mjs`). 실제 설정(`sync.config.mjs`)의 포트폴리오 규칙을 작은 가짜 원본에 적용합니다.
  - 가짜 원본에 `### 2-2. ProWith`, `### 2-3. GENYS Lotto AI`, `### 2-4. Jake English` 제목이 한 번씩 있으면, 결과에서 `#### 기술적 결정`이 두 번(Recueve, ProWith) 나오고 각각 다음 제목 앞에 있습니다.
  - `#### 로그는 NoSQL인 MongoDB에 분리해서 저장했습니다`가 `### 2-4.` 앞에 있습니다.
  - 제목 하나를 빼면 `SyncError`입니다. 원본에 `#### 기술적 결정` 줄이 이미 있어도 `SyncError`입니다.
  - 블록 글에 `<img`, `assets/`가 없습니다.
- [ ] **Step 2: 시험이 실패하는지 봅니다.** `node --test scripts/lib/sync.test.mjs`
- [ ] **Step 3: 규칙 세 개를 씁니다.** 모두 `type: "insert-before"`, `reason: "원본은 2026-11-23에 뺐지만 사이트의 포트폴리오에는 남긴다 (본인 결정 2026-11-23, ADR-0003)"`입니다. 순서는 Recueve, ProWith, Lotto입니다(ProWith 블록 안의 「기술적 결정」 제목이 Recueve 규칙의 첫 줄 검사에 걸리지 않게).

  | startsWith | body의 첫 줄 | body의 내용과 출처 |
  |---|---|---|
  | `### 2-2. ProWith` | `#### 기술적 결정` | 원본 앞선 판(커밋 df3b0ea)의 2-1 「기술적 결정」 표에서 머리 줄과 세 줄(EC2 한 대에…, 무거운 처리를 워커 앱으로 분리, GitHub Actions에서 OIDC로 AWS 인증). 토큰 이원화 줄과 예약 표시이름 줄은 뺍니다. `<div class="split">`은 넣지 않습니다 |
  | `### 2-3. GENYS Lotto AI` | `**쇼핑몰** - 설정으로 켜는 옵션이고, 정산 로직은 건드리지 않고 붙였습니다.` | 2026-11-10 동기화본(`git show e050848:content/synced/portfolio.md`)의 4-2에서: 쇼핑몰 머리 줄과 불릿 2, 4, 5(무통장입금…, 관리자 주문 관리…, 상품 이미지 S3…), `**동적 시스템 설정 엔진**`과 두 불릿, `**백엔드·회원 시스템**`과 불릿 3, 4(다국어…, 조직도 미니맵…). 이어서 `#### 기술적 결정`과 df3b0ea판 2-2 표의 머리 줄과 네 줄(DB 잠금 줄은 뺌) |
  | `### 2-4. Jake English` | `#### 로그는 NoSQL인 MongoDB에 분리해서 저장했습니다` | 같은 동기화본의 4-3에서: 그 절 전체, `#### 개발 모드에서 등급별 계정을 선택해 바로 테스트하게 했습니다` 절(`<img`와 `<sub>` 줄은 뺌), `**인프라** - …` 한 줄 |

  글은 한 글자도 고치지 않고 옮깁니다. `.join("\n")` 배열로 씁니다(이력서 규칙과 같은 모양).
- [ ] **Step 4: 시험 통과.** `node --test scripts/lib/sync.test.mjs`
- [ ] **Step 5: 동기화합니다.** `npm run sync` 뒤 `npm run sync -- --check`가 통과합니다. `grep -c "기술적 결정" content/synced/portfolio.md`는 2, `grep -c "<style>" content/synced/portfolio.md`는 1입니다. `git diff --stat content/synced`에 `resume.md`와 `portfolio.md`가 보입니다.
- [ ] **Step 6: 커밋.** 이 시점에는 `/work` 시험이 아직 실패합니다. 태스크 2와 묶어 커밋합니다(아래).

### Task 2: 원문 읽기

**Files:**
- Modify: `src/lib/portfolio.mjs`
- Modify: `scripts/lib/portfolio.test.mjs`
- Modify: `content/site/work.md` (chapters, intro, sources, 주석)
- Modify: `src/lib/content.ts` (형)
- Modify: `scripts/lib/content.test.mjs`

**Interfaces:**
- Produces:
  - `parseDetail(section) → { name, subtitle, period, role, links: { url: string, label: string | null }[], stack: string[], lead, body }`
  - `glance(md, project: string) → { what: string, howToView: string }`
  - `composeChapters(md, chapters) → { slug, head, howToView, body, after: { id, title, body } | null }[]`. `head`는 `parseDetail`의 결과에서 `body`를 뺀 것이고 `lead`는 규칙을 적용한 값입니다.
  - 챕터 설정: `{ slug, detail, lead?: "glance", after?: { section, until?, id }, image?: "jake-english-video", imageAlt?: string, drop?, replace? }`
  - `howToView` 함수와 설정의 `ai`, `aiUntil`, `howToView`는 없앱니다.
  - `content.ts`: `export type WorkSlug = ProjectSlug | "jake-english"`, `WorkChapter`와 `WorkPage["chapters"]`를 위 모양으로.

- [ ] **Step 1: `portfolio.test.mjs`의 가짜 원본을 새 형식으로 바꾸고 시험을 씁니다.**
  - 가짜 원본: `## 1. 한눈에 보기` 아래 `<table class="glance">`와 `<tr><td><a href="https://alpha.example.com"><strong>Alpha</strong></a><br>풀스택<br>2026.01</td><td>첫 소개<br><strong>숫자</strong></td><td>가입 후 <code>로그인</code></td></tr>` 같은 줄 둘, `## 2. 프로젝트 상세` 아래 `### 2-1. Alpha - 첫 서비스`(`2026.01 ~ 2026.02 | 개인 프로젝트 (풀스택) | 🔗 https://alpha.example.com`)와 `### 2-2. Beta - 둘째 서비스`(`2026.03 | 개인 프로젝트 | 🔗 https://a.example.com (소개 영상) · https://b.example.com (공개 저장소)`), `## 3. AI 활용 - 개발` 아래 굵은 한 문장과 `### 3-1. Alpha - 스킬`, `#### 무엇을`, `### 3-2. Beta - 앱`.
  - `parseDetail`: Alpha는 `period === "2026.01 ~ 2026.02"`, `links`가 `[{ url: "https://alpha.example.com", label: null }]`. Beta는 `links`가 `[{ url: "https://a.example.com", label: "소개 영상" }, { url: "https://b.example.com", label: "공개 저장소" }]`.
  - `parseDetail`이 멈추는 경우: `**2026.01** | …`(굵은 기간), 주소 없는 줄, `🔗 https://a.example.com https://b.example.com`(가운뎃점 없이 둘).
  - `glance(MD, "Alpha")`는 `{ what: "첫 소개", howToView: "가입 후 <code>로그인</code>" }`. 없는 이름과 두 번 나오는 이름은 `PortfolioError`.
  - `composeChapters`: `after: { section: "3. AI 활용 - 개발", until: "3-2. Beta", id: "alpha-ai" }`이면 `after.title === "AI 활용 - 개발"`, `after.id === "alpha-ai"`, `after.body`에 `#### Alpha - 스킬`과 `##### 무엇을`이 있고 `3-1.`과 `3-2`는 없습니다. `lead: "glance"`이면 `head.lead === "첫 소개"`이고 `body`가 `> `로 시작하는 원문 인용으로 시작합니다. `after`가 없으면 `after === null`.
- [ ] **Step 2: 실패 확인.** `node --test scripts/lib/portfolio.test.mjs`
- [ ] **Step 3: `portfolio.mjs`를 구현합니다.** 시안의 구현을 위 이름과 형에 맞춰 정리합니다. 파일 머리 주석과 함수 주석의 옛 절 번호를 고칩니다.
- [ ] **Step 4: `work.md`를 고칩니다.**

  ```yaml
  intro: 직접 설계하고 개발한 프로젝트 네 개입니다. 서비스 세 곳은 지금 열어보실 수 있습니다.
  sources:
    - 직접 설계하고 개발한 프로젝트 네 개입니다. 서비스 세 곳은 지금 열어보실 수 있습니다.
  chapters:
    - slug: recueve
      detail: 2-1. Recueve
      after: { section: 4. AI 활용 - 제품, id: recueve-ai }
      drop: [앞의 하네스가]
    - slug: prowith
      detail: 2-2. ProWith
      lead: glance
      after: { section: 3. AI 활용 - 개발, until: 3-2. Jake English, id: prowith-ai }
    - slug: lotto-ai
      detail: 2-3. GENYS Lotto AI
      after: { section: 5-1. GENYS Lotto AI 성능 개선, id: lotto-ai-performance }
      replace:
        - { find: 잡았습니다(5-1), to: 잡았습니다(아래 성능 개선) }
    - slug: jake-english
      detail: 2-4. Jake English
      image: jake-english-video
      imageAlt: Jake English 소개 영상의 첫 장면
  ```

  `introSite`와 `sites`는 그대로입니다. 주석을 새 규칙에 맞게 다시 씁니다.
- [ ] **Step 5: `content.test.mjs`를 고칩니다.**
  - 「짧은 카드가 가리키는 …」: `new Set(work.chapters.filter((c) => c.after).map((c) => `/work#${c.after.id}`))`.
  - 「포트폴리오 챕터는 …」: 챕터 slug는 `["recueve", "prowith", "lotto-ai", "jake-english"]`. 서비스 글이 있는 챕터만 `head.links[0].url === liveUrl`, `head.name === title`을 봅니다. 모든 챕터에 `howToView`가 있습니다. Jake English는 `links`가 둘이고 이름이 `소개 영상`, `공개 저장소`입니다.
  - 「챕터에는 …」: `<img`가 없고, `/\d절 참조|앞의 하네스|\(\d-\d\)/`가 없습니다. `<sub>`는 그림 설명이라 허용합니다. 대상 글은 `body`와 `after?.body`입니다.
  - 「ProWith 상세의 첫 줄 …」: `chapter.head.lead.startsWith(project.summary)`이고, `chapter.body`가 `> **풍부한 관리자 설정이 핵심인`으로 시작합니다.
  - 새 시험: 챕터 본문에 사이트에만 남긴 블록이 있습니다(`recueve`와 `prowith`의 `body`에 `### 기술적 결정`, `lotto-ai`의 `body`에 `### 로그는 NoSQL인 MongoDB에`).
  - 새 시험: 그림 수. 모든 챕터의 `body`와 `after.body`에서 `<svg`가 다섯 번입니다.
- [ ] **Step 6: `content.ts`의 형을 고치고 확인합니다.** `node --test scripts/lib/portfolio.test.mjs`가 통과합니다. `content.test.mjs`는 근거 줄 시험만 실패합니다(태스크 3에서 고침).
- [ ] **Step 7: 커밋 둘.**
  - `feat(sync): keep the dropped project details on the site portfolio` (`scripts/sync.config.mjs`, `scripts/lib/sync.test.mjs`)
  - `feat(app): read the new portfolio layout for /work chapters` (`content/synced/`, `src/lib/portfolio.mjs`, `scripts/lib/portfolio.test.mjs`, `content/site/work.md`, `src/lib/content.ts`, `scripts/lib/content.test.mjs`, 그리고 빌드가 깨지지 않게 태스크 4의 화면 코드까지 같은 커밋에 넣습니다. 그래서 이 커밋은 태스크 4를 마친 뒤에 합니다)

### Task 3: 사이트 전용 글

**Files:**
- Modify: `content/site/projects/recueve.md`, `content/site/projects/prowith.md`, `content/site/projects/lotto-ai.md`
- Modify: `content/site/home.md`, `content/site/jake-english.md`
- Modify: `content/site/ai/prowith-harness.md`, `content/site/ai/code-review.md`, `content/site/ai/recueve-autofill.md`, `content/site/ai/video.md`
- Modify: 「운영 하네스」 이름을 쓰는 화면 코드와 시험(grep으로 찾음)

- [ ] **Step 1: 근거 줄과 값을 고칩니다.** 화면 글은 아래에 적힌 것만 바뀝니다.

  | 파일 | 바꿀 것 |
  |---|---|
  | `projects/recueve.md` | `period: 2026.09 ~ 2026.10`. 근거 줄 `2026.09~` → `2026.09~10`, `카테고리·설명·노트를 생성` → `카테고리·설명을 생성`. 주석의 절 번호 |
  | `projects/prowith.md`, `projects/lotto-ai.md` | 주석의 절 번호(「4-2」 → 「2-2」 등)와 첫 줄 설명 |
  | `home.md` | 근거 줄 `다양한 로직을 직접 구현해 온 경험` → `여러 로직을 직접 구현해 온 경험` |
  | `jake-english.md` | 주석 「이력서와 포트폴리오에는 없다(ADR-0003)」 → 이력서와 포트폴리오에도 실렸고(2026-11-23) 이 글은 `/ai/jake-english`의 사이트 전용 글이라는 문장 |
  | `ai/prowith-harness.md` | `eyebrow: PROWITH · 하네스`, `title: ProWith 하네스`, `built: 업체마다 되풀이되는 작업을 스킬 6종으로 고정하고, 검사 두 가지를 넣었습니다.`, `result: 통과 조건은 제가 정하고, AI가 검사 코드로 옮겼습니다.` 근거 줄 `이 작업들을 재현 가능한 스킬 6종으로 고정`, `검사 두 가지`, `통과 조건은 제가 정하고, AI가 검사 코드로 옮겼습니다`. 주석의 절 번호 |
  | `ai/code-review.md` | 근거 줄 `리뷰 축을 나눈`, `기준 점수 이상인 이슈만`. `누락·스코프 크립` 줄은 지우고 주석에 「스펙 축이 누락과 스코프 크립을 대조한다는 것은 본인이 확인했다(2026-11-23)」 |
  | `ai/recueve-autofill.md` | 근거 줄 `⑦ 실패 시 환불` → `⑦ LLM 호출이 실패하면 크레딧 환불` |
  | `ai/video.md` | 근거 줄 둘을 지우고 주석에 「Recueve 소개 영상의 71.9초 · 6장면 · 1080p와 computer use로 CapCut을 조작해 만든 것은 본인이 확인했다(2026-11-23)」 |

- [ ] **Step 2: 「운영 하네스」를 「하네스」로 바꿉니다.** `grep -rn "운영 하네스" src e2e scripts content docs/01-prd.md docs/02-ia.md docs/03-design.md docs/guide`로 찾은 곳을 모두 고칩니다. `docs/devlog/`와 `docs/adr/`의 옛 기록은 고치지 않습니다.
- [ ] **Step 3: 확인.** `npm test`가 모두 통과합니다. `grep -rn "맡기지 않고\|합격 기준\|반복 운영 업무\|운영 하네스" content/ src/ e2e/`가 비어 있습니다.
- [ ] **Step 4: 커밋.** `fix(content): follow the new source wording in site-only texts`

### Task 4: 화면

**Files:**
- Modify: `src/lib/markdown-plugins.mjs`, `scripts/lib/markdown-plugins.test.mjs`
- Modify: `src/components/markdown.tsx`
- Modify: `src/app/globals.css`
- Modify: `src/components/work/chapter.tsx`, `src/components/work/work-index.tsx`, `src/app/work/page.tsx`
- Modify: `src/lib/project-images.ts`

**Interfaces:**
- Consumes: 태스크 2의 `WorkChapter`, 챕터 설정의 `image`, `imageAlt`.
- Produces: `rehypeFigures()`, `.md-figure` 상자, `Chapter` props `{ chapter, order, total, first, image?, imageAlt?, liveLabel? }`.

- [ ] **Step 1: 플러그인 시험을 씁니다.**
  - `rehypeDropStyle`: `style` 요소가 트리에서 빠지고, 그 뒤의 형제 요소는 남습니다.
  - `rehypeFigures`: `div.fig > svg[aria-label="Recueve 구성도: …"]`가 `div.fig > div.md-figure[role=region][aria-label="Recueve 구성도"][tabIndex=0] > svg`가 됩니다. `.fig` 밖의 `svg`는 그대로입니다. `aria-label`이 없으면 이름은 `그림`입니다.
- [ ] **Step 2: 실패 확인 뒤 구현, 통과.** `node --test scripts/lib/markdown-plugins.test.mjs`. `markdown.tsx`는 `rehypeFigures`를 늘 겁니다(`.fig`가 없으면 하는 일이 없습니다).
- [ ] **Step 3: `globals.css`.** `.md` 묶음에 더합니다.
  - `.md .fig { margin: 1.5rem 0 }`, `.md .md-figure { overflow-x: auto }`(테두리는 SVG 안에 있으므로 주지 않음)
  - `.md .md-figure svg { display: block; width: 100%; min-width: 40rem; height: auto }`
  - `.md .fig p { margin: 0.625rem 0 0; text-align: center }`, `.md .fig sub { vertical-align: baseline; font-size: 0.8125rem; line-height: 1.6 }`에 `text-subtle`
  - `.md h5 { margin: 1.5rem 0 0.625rem; font-size: 0.9375rem; font-weight: 700 }`
- [ ] **Step 4: 챕터와 페이지.**
  - `chapter.tsx`: 버튼은 `head.links`마다 하나, 글은 `link.label ?? liveLabel`, 첫 버튼만 `solid`. 캡처는 `image`가 있을 때만. 붙는 절 제목의 id는 `chapter.after.id`. 머리 주석을 고칩니다.
  - `project-images.ts`: `WORK_IMAGES: Record<WorkSlug, StaticImageData>`를 내보내고 `jake-english`는 `VIDEO_THUMB`(`src/lib/jake-english-images.ts`)을 씁니다.
  - `page.tsx`: 번호는 챕터 순서(`i + 1`), `imageAlt`와 `liveLabel`은 서비스 글이 있으면 거기서, 없으면 챕터 설정에서 읽습니다. 서비스 글도 설정의 `imageAlt`도 없으면 빌드를 멈춥니다.
  - `work-index.tsx`: `lg:grid-cols-5`.
- [ ] **Step 5: 확인.** `npm run typecheck`, `npm run lint`, `npm run check:units`, `npm test`가 통과합니다. 3301을 다시 띄워(`rm -rf .next/dev` 뒤) `curl -s localhost:3301/work`에 `md-figure`가 다섯 번, `<style>`이 0번입니다. 1280과 375, 라이트와 다크로 `/work`를 찍어 봅니다.
- [ ] **Step 6: 커밋.** 태스크 2의 둘째 커밋(`feat(app): read the new portfolio layout for /work chapters`)에 이 태스크의 파일을 함께 넣습니다.

### Task 5: E2E

**Files:**
- Modify: `e2e/work.spec.ts`
- Modify(필요하면): `e2e/ai.spec.ts`, `e2e/ai-case.spec.ts`, `e2e/home.spec.ts`, `e2e/resume.spec.ts`의 이름과 문장

- [ ] **Step 1: `work.spec.ts`를 고칩니다.**
  - 챕터 시험: 서비스 글이 없는 챕터도 돕니다. 캡처의 대체 텍스트와 버튼 글은 페이지와 같은 규칙으로 구합니다. 버튼 수는 `head.links.length`이고 각각 `href`가 맞고 새 창으로 열립니다. 붙는 절 제목의 id는 `chapter.after.id`입니다.
  - 「사이트에서 고친 문장 …」: `아래 성능 개선`이 보이고, `앞의 하네스가`와 `(5-1)`이 없고, `img[src*="assets/"]`가 0입니다.
  - 「보시는 방법의 굵게 표시 …」 시험은 새 원본에서 그 칸이 `<code>`라 지우고, 대신 `#prowith .md-note code`에 `DEMO Login`이 있는지 봅니다.
  - 새 시험 「그림은 다섯 장이고, 좁은 화면에서는 상자 안에서만 넘긴다」: `main .md-figure`가 5개. 모바일 프로젝트에서 첫 상자의 `scrollWidth > clientWidth`이고 `document.documentElement.scrollWidth <= clientWidth`입니다. 설명 줄(`.fig sub`)의 오른쪽 끝이 화면 폭 안입니다.
  - 새 시험 「사이트에만 남긴 블록이 보인다」: `#recueve`와 `#prowith`에 제목 「기술적 결정」, `#lotto-ai`에 「로그는 NoSQL인 MongoDB에 분리해서 저장했습니다」.
- [ ] **Step 2: main 세션에 E2E 차례를 묻고, 받으면 돌립니다.** `npm run verify`. 실패하면 요약 표와 실패 내용을 그대로 알립니다. CSS가 옛것이면 `.next/cache/turbopack`을 지우고 다시 빌드합니다.
- [ ] **Step 3: 커밋.** `test(app): cover the diagrams and the fourth chapter on /work`

### Task 6: /resume 확인

**Files:**
- Modify(필요하면): `src/lib/resume.mjs`, `content/site/resume-page.md`, `e2e/resume.spec.ts`, `scripts/lib/resume.test.mjs`

- [ ] **Step 1: 3301에서 `/resume`을 1280과 375로 봅니다.** Jake English 프로젝트 항목, 「🔗 이름 주소」 줄(주소가 링크로 보이는지), Recueve 기간 「2026.09 ~ 2026.10」, 목차.
- [ ] **Step 2: 어긋난 곳이 있으면 시험을 먼저 쓰고 고칩니다.** 모양을 새로 정해야 하는 문제(링크 줄의 생김새 등)면 고치지 않고 main 세션에 캡처와 함께 묻습니다.
- [ ] **Step 3: 커밋(바뀐 것이 있을 때).** `fix(app): render the new resume link lines`

### Task 7: 문서, PR, devlog

**Files:**
- Modify: `docs/01-prd.md`(F2에 Jake English, F3의 이름), `docs/02-ia.md`(`/work` 절, 자료 형, 이름), `docs/03-design.md`(그림 상자의 값)
- Modify: `docs/superpowers/specs/2026-11-23-work-new-portfolio-design.md`(「운영」을 뺀 이름, 정해진 문구, 근거 처리)
- Modify: `docs/todo/20261015_07_todo_portfolio_images.md`, `docs/todo/20261017_02_todo_resume_link_review_fixes.md`
- Create: `docs/design/work-new-portfolio/`(1280과 375 캡처), `docs/guide/CONTENT_포트폴리오_동기화_20261123.md`와 `docs/guide/README.md` 색인, `docs/devlog/2026-11-23-work-new-portfolio.md`

- [ ] **Step 1: 문서를 고칩니다.** IA의 `/work` 절은 구성(챕터 01~04), 머리 문장, 챕터 표(본문, 뒤에 붙는 절, id), 「사이트에서만 고치는 곳」, 「사이트에만 남기는 블록」(설계의 표), 그림 문단으로 다시 씁니다. 이미지 todo는 원본에서 두 이미지가 없어져 닫는 이유를 상태 줄에 씁니다. 가이드에는 원본 구조가 바뀔 때 멈추는 곳과 고치는 순서, 근거 줄을 한 번에 대조하는 방법, 사이트에만 남기는 블록의 규칙을 씁니다.
- [ ] **Step 2: `npm run verify`를 다시 통과시키고(main에 차례 확인) 커밋.** `docs: record the new /work layout and the site-only portfolio blocks`
- [ ] **Step 3: 푸시하고 PR을 엽니다.** 제목 `feat(app): show the new portfolio diagrams and Jake English on /work`. 본문은 요약, 배경, 한계, 테스트 체크리스트이고 사이트에만 남긴 블록 목록을 넣습니다. `git status`와 `git log origin/feat/work-new-portfolio -1`로 푸시를 확인합니다.
- [ ] **Step 4: devlog를 쓰고 같은 PR에 더한 뒤, main 세션에 PR 주소와 볼 화면을 알립니다.**
