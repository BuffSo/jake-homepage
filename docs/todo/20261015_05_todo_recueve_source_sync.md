# TODO: 원본 이력서·포트폴리오가 Recueve로 바뀐 것에 맞춰 동기화 규칙 정리

> 작성: 2026-10-15
> 상태: **완료** (2026-10-15, 브랜치 `fix/sync-recueve-source`). 남은 일은 [06](20261015_06_todo_recueve_detail_merge.md)으로 넘겼습니다.

## 무엇이 바뀌었나

career 저장소의 `소재희-이력서.md`와 `포트폴리오/소재희-포트폴리오.md`가 2026-10-15에 Recoeve(회사 프로젝트, 2026.04 ~ 05, recoeve.com)에서 Recueve(개인 프로젝트, 2026.09 ~ 현재, recueve.com)로 바뀌었습니다. recoeve.com 링크는 원본에서 모두 빠졌습니다.

## 할 일

- [x] `scripts/sync.config.mjs`의 drop-line 규칙(`startsWith: "| **Recoeve** | recoeve.com은"`)이 찾을 줄이 없어졌습니다. 포트폴리오 `보시는 방법` 표의 그 자리는 이제 `| **Recueve** | https://recueve.com<br>회원가입하시면 ...` 줄입니다.
  - 규칙을 지우고 새 줄은 그대로 싣습니다. 새 줄은 두 서비스의 관계를 말하지 않습니다.
- [x] 같은 날 원본 이력서에서 근거 없는 생산성 수치 3곳(시놀 1줄, 하트링크 2줄)을 홈페이지와 같은 문구로 바꾸고 `🔗 https://heartlink.kr` 줄을 지웠습니다.
  - 홈페이지의 네 규칙(생산성 수치 3개, heartlink drop-line)도 지웠습니다. 남은 규칙은 전화번호 열과 `※ 태니지먼트` 줄 두 개입니다.
- [x] `npm run sync`를 돌렸습니다. 원본 커밋은 `8f0aed6`이고, 민감정보 검사를 통과했습니다. `content/synced/`의 이력서 프로젝트와 포트폴리오에 Recueve가 들어왔습니다.
- [x] 포트폴리오(4-1절 프로젝트 상세, 3절 AI 파이프라인)가 이제 Recueve를 다룹니다.
  - `content/site/projects/recueve.md`에 ProWith·Lotto 글처럼 `sources` 인용을 달아 포트폴리오와 어긋나면 테스트가 잡게 했습니다.
  - CLAUDE.md, ADR-0003, `02-ia.md`, `04-motion.md`에서 Recueve를 "원본에 없는 작업"에서 뺐습니다.
  - 본문을 4-1과 합치는 일은 F2로 넘겼습니다([06](20261015_06_todo_recueve_detail_merge.md)).
- [x] 문구 차이: 포트폴리오 파이프라인 1단계는 `크레딧 1개 차감`입니다(recueve가 2026-09-14에 사용자 노출 이름을 레코토큰에서 크레딧으로 바꿈). 사이트 글도 `크레딧 1개 차감`으로 맞췄습니다.
