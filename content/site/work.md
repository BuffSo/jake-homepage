---
label: WORK
title: 포트폴리오
intro: 직접 설계·개발·배포한 서비스 세 개입니다. 세 곳 모두 지금 열어보실 수 있습니다.
introSite: 의뢰받아 만든 사이트 두 개도 함께 싣습니다.
sources:
  - 직접 설계·개발·배포한 서비스 세 개입니다. 세 곳 모두 지금 열어보실 수 있습니다.
sites:
  label: SITES
  title: 의뢰받아 만든 사이트
  intro: 회사 소개 사이트 두 곳을 의뢰받아 만들었습니다. 두 사이트 모두 소스를 공개 저장소에 두었습니다.
chapters:
  - slug: recueve
    detail: 4-1. Recueve
    ai: 3. AI 활용 - 제품
    howToView: Recueve
    drop:
      - 앞의 하네스가
    replace:
      - find: 3절 참조
        to: 아래 AI 활용 - 제품 참조
  - slug: prowith
    detail: 4-2. ProWith
    ai: 2. AI 활용 - 개발
    aiUntil: 개발 외의 일
    howToView: ProWith
    drop:
      - '<img src="assets/prowith-genealogy-minimap.png"'
      - <sub>추천계보 조직도
    replace:
      - find: 그누보드5 기반 레거시를 NestJS + Next.js로 새로 구축한 MLM 솔루션
        to: 보상플랜과 쇼핑몰을 설정으로 켜고 끄는 MLM 정산 솔루션
  - slug: lotto-ai
    detail: 4-3. GENYS Lotto AI
    howToView: GENYS Lotto AI
    drop:
      - '<img src="assets/lotto-dev-account-switcher.png"'
      - <sub>개발 모드에서만
    replace:
      - find: 로그는 관계형 DB에 넣지 않았습니다
        to: 로그는 NoSQL인 MongoDB에 분리해서 저장했습니다
---

<!--
/work 페이지 글과 챕터 구성 (docs/02-ia.md /work).
- intro는 포트폴리오 "1. 한눈에 보기"의 문장이다(sources로 테스트가 확인한다). introSite와 sites는 사이트 전용 글이다.
- 챕터 본문은 포트폴리오 원문을 그대로 그린다(src/lib/portfolio.mjs). detail은 "4. 프로젝트 상세"의 절, ai는 이어 붙일 AI 절, aiUntil은 AI 절에서 멈출 제목, howToView는 "보시는 방법" 표의 서비스 이름이다.
- drop과 replace는 원문의 절 순서(2 → 3 → 4)와 챕터 순서가 달라 맞지 않는 곳, 싣지 않는 이미지, 홈과 맞출 첫 줄, 사이트에서 고쳐 쓴 소제목만 고친다. 각 규칙은 정확히 한 번 맞아야 하고, 원문에서 대상이 사라지면 빌드와 테스트가 멈춘다.
  - Recueve: 3절 첫 문단은 앞에 나온 하네스를 가리키지만, 이 페이지에서는 Recueve가 먼저 나온다. 4-1의 "3절 참조"는 바로 아래 AI 절을 가리키게 바꾼다.
  - ProWith, Lotto: 포트폴리오 이미지와 설명 줄은 싣지 않는다(docs/todo/20261015_07_todo_portfolio_images.md).
  - ProWith: 4-2의 첫 인용 줄(레거시 전환)을 홈 서비스 목록의 소개와 같은 문장으로 바꾼다. 강점인 설정과 쇼핑몰이 먼저 보이게 하기 위해서다. 문장의 근거는 content/site/projects/prowith.md의 sources에 있다.
  - Lotto: 4-3의 소제목 "로그는 관계형 DB에 넣지 않았습니다"를 한 일로 쓴 제목으로 바꾼다(2026-10-19). 하지 않은 일보다 한 일(로그를 MongoDB에 나눠 저장)이 먼저 보이게 하기 위해서다. 뜻은 바로 아래 본문(PostgreSQL 대신 MongoDB Atlas에 따로 담음)과 같다. 원본은 이 저장소에서 고치지 않는다(ADR-0003).
-->
