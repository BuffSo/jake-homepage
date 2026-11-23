---
label: WORK
title: 포트폴리오
intro: 직접 설계하고 개발한 프로젝트 네 개입니다. 서비스 세 곳은 지금 열어보실 수 있습니다.
introSite: 의뢰받아 만든 사이트 세 개도 함께 싣습니다.
sources:
  - 직접 설계하고 개발한 프로젝트 네 개입니다. 서비스 세 곳은 지금 열어보실 수 있습니다.
sites:
  label: SITES
  title: 의뢰받아 만든 사이트
  intro: 회사 소개 사이트 두 곳과 숙소 안내서 하나를 의뢰받아 만들었습니다.
chapters:
  - slug: recueve
    detail: 2-1. Recueve
    after:
      section: 4. AI 활용 - 제품
      id: recueve-ai
    drop:
      - 앞의 하네스가
  - slug: prowith
    detail: 2-2. ProWith
    lead: glance
    after:
      section: 3. AI 활용 - 개발
      until: 3-2. Jake English
      id: prowith-ai
  - slug: lotto-ai
    detail: 2-3. GENYS Lotto AI
    after:
      section: 5-1. GENYS Lotto AI 성능 개선
      id: lotto-ai-performance
    replace:
      - find: 잡았습니다(5-1)
        to: 잡았습니다(아래 성능 개선)
  - slug: jake-english
    detail: 2-4. Jake English
    image: jake-english-video
    imageAlt: Jake English 소개 영상의 첫 장면
---

<!--
/work 페이지 글과 챕터 구성 (docs/02-ia.md /work).
- intro는 포트폴리오 "1. 한눈에 보기"의 문장이다(sources로 테스트가 확인한다). introSite와 sites는 사이트 전용 글이다.
- 챕터 본문은 포트폴리오 원문을 그대로 그린다(src/lib/portfolio.mjs). detail은 "2. 프로젝트 상세"의 절이고, after는 그 뒤에 붙일 절이다.
  after.section은 절 제목의 앞부분, until은 그 절에서 멈출 제목, id는 붙는 절 제목의 id다(/ai와 /ai/case가 /work#prowith-ai, /work#recueve-ai로 가리킨다).
- "보시는 방법"은 "1. 한눈에 보기" 표에서 프로젝트 이름이 같은 줄의 셋째 칸이다.
- lead: glance면 큰 글씨 첫 줄을 그 표의 "무엇인가" 첫 줄로 쓰고, 원문 인용은 본문 맨 앞에 그대로 둔다. ProWith의 인용이 세 문장이라 큰 글씨로 쓰기에 길고,
  표의 문장이 홈 서비스 목록의 소개와 같은 말이기 때문이다(2026-11-23, 그 전에는 replace로 홈 문장을 넣었다).
- image와 imageAlt는 서비스 글(content/site/projects/)이 없는 챕터의 머리 그림이다. Jake English는 열어 볼 서비스가 없어 소개 영상 썸네일을 쓴다(2026-11-23).
- drop과 replace는 원문의 절 순서와 챕터 순서가 달라 맞지 않는 곳만 고친다. 각 규칙은 정확히 한 번 맞아야 하고, 원문에서 대상이 사라지면 빌드와 테스트가 멈춘다.
  - Recueve: 4절 첫 문단은 앞에 나온 하네스를 가리키지만, 이 페이지에서는 Recueve가 먼저 나온다.
  - GENYS Lotto AI: 2-3의 "(5-1)"은 절 번호라 이 페이지에서는 바로 아래 절을 가리키는 말로 바꾼다.
- 원본이 인쇄본 분량에 맞춰 뺀 상세(기술적 결정 표 등)는 동기화 규칙으로 사이트에만 남긴다(scripts/sync.config.mjs).
-->
