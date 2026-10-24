# 결정 기록 (ADR)

되돌리기 어려운 결정을 내릴 때마다 한 건씩 남깁니다. AI가 제안한 안과 제가 내린 판단이 다를 때는 "판단" 절에 그 차이를 적습니다.

| 번호 | 결정 | 상태 |
|---|---|---|
| [0001](0001-static-shell-with-dynamic-features.md) | 정적 사이트로 끝내지 않고, 정적 셸에 동적 기능을 더한다 | 채택 |
| [0002](0002-personal-hub-for-everyone.md) | 방문자를 가리지 않는 개인 허브로 만든다 | 채택 (방문 통계 범위는 0012로 넓힘) |
| [0003](0003-content-source-and-sync.md) | 콘텐츠 원본은 이력서·포트폴리오 같은 원본 파일이고, 허용 목록으로 동기화한다 | 채택 (AI 도구 활용 사례 원본 2026-10-20 추가) |
| [0004](0004-ask-answer-policy.md) | 질문 창은 사실만 답하고, 해석과 개인 조건은 답하지 않는다 | 채택 (구현은 2차) |
| [0005](0005-nextjs16-vercel-genys-domain.md) | Next.js 16, Vercel, genys.kr 루트 도메인 | 채택 (도메인은 0011로 바뀜) |
| [0006](0006-public-repo-and-privacy.md) | 처음부터 공개 저장소로 운영하고 민감정보는 네 겹으로 막는다 | 채택 |
| [0007](0007-yaml-frontmatter.md) | 사이트 전용 글의 앞부분 데이터는 yaml 패키지로 읽는다 | 채택 |
| [0008](0008-playwright-e2e.md) | 화면 확인은 Playwright E2E로 자동화한다 | 채택 |
| [0009](0009-markdown-renderer.md) | 포트폴리오와 이력서 원문은 react-markdown으로 그린다 | 채택 |
| [0010](0010-stack-from-source.md) | 첫 화면 기술 층의 기술-서비스 짝은 각 서비스의 소스 코드로 확인한다 | 채택 |
| [0011](0011-jakeso-dev-domain.md) | 대표 주소를 jakeso.dev로 정한다 | 채택 |
| [0012](0012-vercel-web-analytics.md) | 방문 통계는 Vercel Web Analytics로 익명으로 센다 | 채택 |

## 양식

```md
# ADR-NNNN: 제목

- 상태: 제안 | 채택 | 대체됨(ADR-XXXX)
- 날짜: YYYY-MM-DD

## 배경
## 검토한 안
## 판단
## 결정
## 영향
```
