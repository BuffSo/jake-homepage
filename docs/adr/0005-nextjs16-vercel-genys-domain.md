# ADR-0005: Next.js 16, Vercel, genys.kr 루트 도메인

- 상태: 채택
- 날짜: 2026-10-14

## 배경

운영 중인 서비스들은 Next.js로 만들었습니다(Recueve와 ProWith는 16, GENYS Lotto AI는 15). 사이트도 같은 생태계에서 만들면 새로 익힐 것이 없고, 이력서의 스택과도 맞습니다.

## 결정

| 영역 | 선택 | 메모 |
|---|---|---|
| 프레임워크 | Next.js 16.4 (App Router) | Cache Components와 Partial Prefetching이 기본으로 켜져 있습니다 |
| 언어 | TypeScript (strict) | |
| 스타일 | Tailwind CSS 4 | |
| 배포 | Vercel | GENYS Lotto AI와 같은 팀에서 운영합니다 |
| 도메인 | `genys.kr` 루트 | `lotto.genys.kr`은 그대로 둡니다. DNS는 등록 기관에서 관리합니다. 대표 주소는 [ADR-0011](0011-jakeso-dev-domain.md)에서 `jakeso.dev`로 바꿨습니다 |

## 판단

AI는 처음에 Next.js 15를 제안했습니다. 만들기 직전에 npm에서 최신 안정판이 16.4인 것을 확인하고 16으로 바꿨습니다. Recueve, ProWith와 같은 메이저 버전입니다.

Next.js 16은 학습 데이터와 다른 부분이 있습니다. 그래서 에이전트는 코드를 쓰기 전에 `node_modules/next/dist/docs/`의 문서를 먼저 읽습니다(`AGENTS.md`).

## 영향

- `genys.kr` 루트와 `www`를 Vercel에 연결하는 DNS 레코드는 배포할 때 추가합니다. 값은 Vercel이 도메인을 추가할 때 보여 주는 것을 씁니다.
