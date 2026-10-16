---
slug: workbench
order: 2
group: dev
eyebrow: WORKBENCH · 작업 환경
title: 작업 환경
headline: 에이전트 여러 개를 맥북과 휴대폰에서 이어서 다룹니다.
problem: 에이전트와 하는 일이 프로젝트마다 흩어지고, 자리를 비우면 이어서 지시할 수 없었습니다.
built: Orca로 프로젝트마다 Claude Code 세션을 띄워 나란히 돌리고, 휴대폰의 Orca 앱으로 맥북의 세션을 그대로 보며 이어서 지시합니다. 화면 확인과 사이트 설정 같은 브라우저 일은 Aside 브라우저에서 에이전트와 함께 하고, 코드는 VS Code로 읽고 고칩니다. Google Antigravity는 에디터로 많이 써 봤고, 지금은 Antigravity CLI로 PR 리뷰를 Gemini 4 Argon으로도 돌려 Claude 리뷰와 비교합니다.
result: 이 사이트의 도메인도 Aside 브라우저에서 Vercel과 DNS 설정 화면을 다뤄 연결했고, 로그인과 저장은 제가 직접 했습니다. 이 사이트의 PR에는 두 리뷰의 코멘트가 함께 남아 있습니다.
metric:
  value: 맥북 · 휴대폰
  label: 같은 세션을 이어서
figure: workbench-flow
links:
  - label: Orca
    href: https://github.com/stablyai/orca
  - label: Aside
    href: https://aside.com
  - label: Antigravity
    href: https://antigravity.google
---

<!--
쓰는 도구와 그 도구로 하는 일만 쓴다. 다른 제품과의 비교는 확인할 근거가 없어 쓰지 않는다 (2026-10-16 결정).
Orca가 데스크톱, 모바일, 원격 실행을 지원하는 것은 저장소 설명에서, Aside는 aside.com에서 확인했다(2026-10-16).
도메인 연결은 docs/todo/20261015_02_todo_genys_domain.md, 두 리뷰의 비교는 docs/todo/20261015_04_todo_gemini_argon_pr_review.md에 있다.
리뷰를 하나로 고르면 built의 마지막 문장을 고친다.
도구 화면은 다른 프로젝트 이름이 보여서 캡처하지 않고 도식으로 그린다.
-->
