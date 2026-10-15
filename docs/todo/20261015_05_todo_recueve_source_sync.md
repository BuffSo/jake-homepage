# TODO: 원본 이력서·포트폴리오가 Recueve로 바뀐 것에 맞춰 동기화 규칙 정리

> 작성: 2026-10-15
> 상태: **완료** (2026-10-15, 브랜치 `fix/sync-recueve-source`). 남은 일은 [06](20261015_06_todo_recueve_detail_merge.md)으로 넘겼습니다.

## 무엇이 바뀌었나

career 저장소의 `소재희-이력서.md`와 `포트폴리오/소재희-포트폴리오.md`가 2026-10-15부터 Recueve(개인 프로젝트, 2026.09 ~ 현재, recueve.com)를 다룹니다.

## 할 일

- [x] 포트폴리오 `보시는 방법` 표의 안내 줄 하나를 빼던 drop-line 규칙이 찾을 줄을 잃었습니다. 그 표에는 이제 Recueve 줄이 있습니다.
  - 규칙을 지우고 Recueve 줄은 그대로 싣습니다.
- [x] 같은 날 원본 이력서에서 근거 없는 생산성 수치 3곳(시놀 1줄, 하트링크 2줄)을 홈페이지와 같은 문구로 바꾸고 `🔗 https://heartlink.kr` 줄을 지웠습니다.
  - 홈페이지의 네 규칙(생산성 수치 3개, heartlink drop-line)도 지웠습니다. 남은 규칙은 두 개로, 전화번호 열을 빼는 규칙과 `※ 태니지먼트` 줄을 빼는 규칙입니다.
- [x] `npm run sync`를 돌렸습니다. 원본 커밋은 `8f0aed6`이고, 민감정보 검사를 통과했습니다. `content/synced/`의 이력서 프로젝트와 포트폴리오에 Recueve가 들어왔습니다.
- [x] 포트폴리오(4-1절 프로젝트 상세, 3절 AI 파이프라인)가 이제 Recueve를 다룹니다.
  - `content/site/projects/recueve.md`에 ProWith·Lotto 글처럼 `sources` 인용을 달아 포트폴리오와 어긋나면 테스트가 잡게 했습니다.
  - CLAUDE.md, ADR-0003, `02-ia.md`, `04-motion.md`에서 Recueve를 "원본에 없는 작업"에서 뺐습니다.
  - 본문을 4-1과 합치는 일은 F2로 넘겼습니다([06](20261015_06_todo_recueve_detail_merge.md)).
- [x] 사이트 글의 파이프라인 1단계 문구를 포트폴리오와 같은 `크레딧 1개 차감`으로 맞췄습니다.
