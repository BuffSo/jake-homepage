---
slug: this-site
order: 4
eyebrow: THIS SITE · 하네스 엔지니어링
title: 이 사이트
headline: 이 사이트도 같은 방식으로 만들었습니다.
desc: 기획 문서와 결정 기록을 먼저 쓰고, AI와 함께 구현하고, 검사와 CI로 확인합니다. 기준을 장치로 고정하는 이 방식을 하네스 엔지니어링이라고 부릅니다.
metric:
  value: ADR {adrCount}개 · CI 검사 {ciCheckCount}가지
  label: 결정 기록과 자동 검사 (빌드할 때 저장소에서 셉니다)
figure: site-steps
links:
  - label: 저장소
    href: https://github.com/BuffSo/jake-homepage
---

<!--
숫자는 적어 두지 않고 빌드할 때 센다 (src/lib/content.ts).
{adrCount}는 docs/adr/의 ADR 파일 수, {ciCheckCount}는 .github/workflows/ci.yml에서 npm ci 뒤의 검사 단계 수다.
/ai 상세 본문은 F3에서 쓴다.
-->
