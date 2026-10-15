---
slug: this-site
order: 1
group: dev
home: 4
eyebrow: THIS SITE · 하네스 엔지니어링
title: 이 사이트
headline: 이 사이트도 같은 방식으로 만들었습니다.
desc: 기획 문서와 결정 기록을 먼저 쓰고, AI와 함께 구현하고, 검사와 CI로 확인합니다. 기준을 장치로 고정하는 이 방식을 하네스 엔지니어링이라고 부릅니다.
problem: AI로 빠르게 만들면 결정의 이유와 확인 기준이 대화 속에 묻힙니다.
built: 기능마다 기획(질문 라운드, 스토리보드) → 결정 기록 → 계획 승인 → 구현 → 검사 → 리뷰 → 기록 순서를 CLAUDE.md에 적었습니다. 커밋 전 민감정보 검사, 커밋 메시지 형식 검사, 훅을 건너뛰는 커밋을 막는 훅, CI 검사로 기준을 장치에 고정했습니다.
result: 결정 기록, 작업 일지, 검사 설정이 모두 저장소에 공개되어 있습니다.
metric:
  value: ADR {adrCount}개 · CI 검사 {ciCheckCount}가지
  label: 결정 기록과 자동 검사 (빌드할 때 저장소에서 셉니다)
figure: site-steps
links:
  - label: 저장소
    href: https://github.com/BuffSo/jake-homepage
    home: true
  - label: ADR 목록
    href: https://github.com/BuffSo/jake-homepage/tree/main/docs/adr
  - label: 작업 일지
    href: https://github.com/BuffSo/jake-homepage/tree/main/docs/devlog
---

<!--
숫자는 적어 두지 않고 빌드할 때 센다 (src/lib/content.ts).
{adrCount}는 docs/adr/의 ADR 파일 수, {ciCheckCount}는 .github/workflows/ci.yml에서 npm ci 뒤의 검사 단계 수다.
만든 것의 훅은 .githooks/pre-commit(민감정보 검사), .githooks/commit-msg(형식 검사), .claude/settings.json의 scripts/hooks/guard-git-commit.mjs다.
links의 home: true인 링크만 홈 카드에 보인다.
-->
