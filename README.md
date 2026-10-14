# jake-homepage

제 개인 홈페이지 [genys.kr](https://genys.kr)의 소스입니다.

사이트가 결과물이라면, 이 저장소는 그 과정입니다. 기획 문서, 결정 기록, 에이전트 작업 규칙, 검증 장치를 처음부터 함께 공개합니다.

## 이 저장소에서 볼 수 있는 것

| 무엇 | 어디 |
|---|---|
| 왜 만드는지, 누가 보는지 | [docs/00-vision.md](docs/00-vision.md) |
| 요구사항과 범위 | [docs/01-prd.md](docs/01-prd.md) |
| 페이지 구조와 콘텐츠 모델 | [docs/02-ia.md](docs/02-ia.md) |
| 디자인 원칙 | [docs/03-design.md](docs/03-design.md) |
| 첫 화면 움직임: 재료, 방향, 금지 목록, 박자 | [docs/04-motion.md](docs/04-motion.md) |
| 결정 기록 (ADR) | [docs/adr/](docs/adr/) |
| 작업 일지: AI 제안, 제 판단, 결과 | [docs/devlog/](docs/devlog/) |
| 에이전트 작업 규칙 | [CLAUDE.md](CLAUDE.md) |
| 콘텐츠 동기화: 이력서·포트폴리오에서 무엇을 가져와 공개하는지 | [scripts/sync.config.mjs](scripts/sync.config.mjs) |
| 민감정보 차단 장치 | [scripts/check-sensitive.mjs](scripts/check-sensitive.mjs) · [.githooks/](.githooks/) · [.claude/settings.json](.claude/settings.json) · [CI](.github/workflows/ci.yml) |

## 일하는 방식

AI 코딩 에이전트(Claude Code)를 활용해 빠르게 구현하고, 저는 요구사항과 결정, 완료 기준을 정하고 결과를 판단합니다.

1. **문서 먼저** - 요구사항은 PRD에, 되돌리기 어려운 결정은 ADR에 먼저 남깁니다.
2. **규칙 안에서 구현** - 에이전트는 [CLAUDE.md](CLAUDE.md)의 규칙을 따릅니다. 질문에는 답만 하고, 커밋은 제가 내용을 확인한 뒤에만 합니다.
3. **통과해야 끝** - 타입체크, 린트, 빌드, 민감정보 검사를 통과해야 작업이 끝납니다.
4. **기록** - 기능이 끝날 때마다, 그리고 AI 제안과 제 판단이 갈렸을 때 무엇을 제안받았고 무엇을 바꿨는지 devlog에 남깁니다.

## 스택

Next.js 16 (App Router) · TypeScript · Tailwind CSS 4 · Vercel

## 로컬 실행

```bash
npm install
npm run dev
```

`npm install`을 하면 커밋 전 민감정보 검사 훅이 함께 설정됩니다.

## 진행 상황

- [x] 0단계 - 기반 문서와 하네스 (2026-10-14)
- [ ] 1차 - 홈, 프로젝트 상세, AI 작업 카드, 이력서 페이지
- [ ] 2차 - 질문 창, 라이브 데이터, 영어 페이지
