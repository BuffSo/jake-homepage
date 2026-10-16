---
headline: Idea to production.
lines:
  - 기획부터 디자인, 개발, 배포까지 전 과정을 다룹니다.
  - 속도는 AI로 내고, 판단과 검증은 AI 이전부터 쌓은 경험으로 합니다.
contact:
  email: buff4701@gmail.com
  github: https://github.com/BuffSo
layers:
  - name: 화면
    items:
      - name: Next.js
        usedBy: [recueve, prowith, lotto-ai]
      - name: React
        usedBy: [recueve, prowith, lotto-ai]
        evidence: [Next.js]
      - name: Tailwind
        usedBy: [recueve]
  - name: API
    items:
      - name: NestJS
        usedBy: [recueve, prowith]
      - name: Node.js
        usedBy: [recueve, prowith, lotto-ai]
        evidence: [NestJS, Next.js]
      - name: TypeScript
        usedBy: [recueve, prowith, lotto-ai]
  - name: 워커
    items:
      - name: BullMQ
        usedBy: [recueve]
      - name: AWS Lambda
        usedBy: [lotto-ai]
      - name: EventBridge
        usedBy: [lotto-ai]
  - name: 데이터
    items:
      - name: PostgreSQL
        usedBy: [prowith, lotto-ai]
      - name: Redis
        usedBy: [recueve, lotto-ai]
      - name: Prisma
        usedBy: [recueve, prowith, lotto-ai]
  - name: 인프라
    items:
      - name: AWS
        usedBy: [recueve, prowith, lotto-ai]
      - name: Docker
        usedBy: [recueve, prowith]
      - name: Vercel
        usedBy: [recueve, prowith, lotto-ai]
  - name: AI
    items:
      - name: Claude Code
        usedBy: [recueve, prowith]
        evidence: [MCP]
      - name: MCP
        usedBy: [recueve]
      - name: Claude API
        usedBy: [recueve]
        evidence: [Haiku, Sonnet]
sections:
  work:
    label: WORK
    title: 운영 중인 서비스
    intro: 지금 열어 보실 수 있는 서비스 세 개입니다.
  ai:
    label: AI
    title: AI로 일하는 방식
    intro: 구현은 AI를 활용해 빠르게 하고, 기준은 장치로 고정합니다. 개발 밖의 일에도 같은 방식을 씁니다.
about:
  label: ABOUT
  title: 안녕하세요, 소재희입니다.
  body: AI를 더해 기술을 비즈니스 가치로 연결하는 풀스택 개발자입니다. 기술연구소 연구원으로 시작해 증권사 대상 솔루션 회사를 대표이사 겸 연구소장으로 이끌었고, 정부 기술개발 과제를 총괄책임자로 맡아 사업화까지 이뤘습니다. 지금은 NestJS, Next.js, AWS로 서비스를 기획부터 배포까지 만듭니다.
  quote: 나이와 경력, 실력에 상관없이 늘 누구에게나 일관성있게 겸손히 소통하시는 모습이 멋있었습니다.
  quoteBy: 팀 프로젝트 동료 평가
sources:
  - AI를 더해 기술을 비즈니스 가치로 연결하는 풀스택 개발자
  - 기술연구소 연구원
  - 증권사 대상 솔루션 제공 및 SI 사업
  - 대표이사 겸 연구소장
  - 정부 기술개발 과제를 총괄책임자로 이끌어 성공 판정과 사업화까지
  - 나이와 경력, 실력에 상관없이 늘 누구에게나 일관성있게 겸손히 소통하시는 모습이 멋있었습니다.
  - Claude Code에 연결
---

<!--
홈 첫 화면과 섹션 문구 (docs/02-ia.md 홈).
기술 층의 기술 이름은 포트폴리오 "6. 기술 스택"에 있는 것만 쓴다. 기술마다 쓴 서비스(usedBy)는 docs/04-motion.md "기술 층" 표를 따른다.
usedBy는 그 서비스의 이력서·포트폴리오 항목에 기술 이름이나 evidence 낱말이 있는 서비스와 정확히 같아야 한다(테스트가 양방향으로 대조).
evidence: Node.js ← NestJS, Next.js(그 위에서 돈다) · React ← Next.js(React 프레임워크) · Claude API ← Haiku, Sonnet(Claude 모델)
· Claude Code ← MCP(포트폴리오 2절 "MCP 서버를 직접 구현해 Claude Code에 연결", sources에 둠).
sources의 문장은 동기화한 이력서와 포트폴리오에 그대로 있어야 한다 (scripts/lib/content.test.mjs).
-->
