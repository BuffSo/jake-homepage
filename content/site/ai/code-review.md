---
slug: code-review
order: 2
group: dev
eyebrow: CODE REVIEW · 리뷰 스킬
title: 코드 리뷰 스킬
headline: 리뷰 축을 나눈 에이전트가 PR을 함께 봅니다.
problem: AI 리뷰는 지적이 많고, 진짜 문제를 골라내는 일이 다시 사람 몫이 됩니다.
built: 코드 축 리뷰어 다섯(규칙, 버그, 변경 이력, 이전 PR 코멘트, 코드 주석)과 스펙 축 리뷰어 하나를 병렬로 띄웁니다. 지적마다 새 에이전트가 점수를 매겨 80점 이상만 남기고, 스펙 축은 설계 문서 문장을 인용해야만 지적할 수 있습니다. 구현한 세션이 자기 코드를 심사하지 않게 판정은 새 컨텍스트에서 합니다.
result: 보고서를 먼저 보고, 기준을 넘은 지적만 PR 코멘트로 게시합니다. 이 사이트의 PR에 리뷰 코멘트가 남아 있습니다.
metric:
  value: 리뷰어 6명 · 80점 기준
  label: 코드 축 5명과 스펙 축 1명
figure: review-flow
links:
  - label: 리뷰 코멘트 보기
    href: https://github.com/BuffSo/jake-homepage/pull/3#issuecomment-6191984638
sources:
  - 리뷰 축을 나눠
  - 기준 점수 이상만 보고
  - 누락·스코프 크립
---

<!--
포트폴리오 "2. AI 활용 - 개발 > 개발 외의 일"의 코드 리뷰 줄에 있는 작업이다. sources는 원문과 대조한다 (scripts/lib/content.test.mjs).
리뷰어 구성과 80점 기준은 리뷰 스킬(pr-review)의 SKILL.md에서 확인했다(2026-10-15). 스킬 저장소는 비공개라 링크하지 않는다.
-->
