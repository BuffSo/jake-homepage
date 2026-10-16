# TODO: Gemini 4 Argon으로 PR 리뷰하기 (agy)

> 작성: 2026-10-15 · 고침: 2026-10-16
> 상태: **진행 중** (PR #8에서 한 번 시험함, 리뷰 루프에 넣을지는 미정)

## 결론
Antigravity CLI(`agy`)는 이미 로그인돼 있고, 2026-10-16부터 모델 목록에 Argon이 보인다. PR 리뷰는 `agy`에게 직접 시킨다. 클라우드 설정(Vertex AI, GitHub Actions)은 하지 않는다.

## 시험한 방법 (PR #8, 2026-10-16)
1. 작업용 임시 폴더에 저장소를 새로 클론하고 PR 브랜치를 받는다. `CLAUDE.local.md`, `.sensitive-terms.local`, `.env.local` 같은 로컬 전용 파일이 없는 곳이어야 한다. jake-homepage 폴더에서 돌리면 이 파일들이 Google로 넘어갈 수 있다.
2. PR diff와 본문을 클론 안 `.review/`에 파일로 둔다.
3. `agy --model gemini-4-argon-high --mode plan --sandbox --print-timeout 20m -p "<리뷰 지시>"`로 돌린다. `--mode plan`이라 파일을 고치지 않는다.
4. 결과의 링크는 클론의 로컬 경로(`file://`)를 가리킨다. 리뷰한 커밋의 GitHub 주소로 바꾸고, 배너를 붙여 `gh pr comment`로 단다.

## 결과 (PR #8)
- 약 17분 걸렸다. 지적 5건(중간 1, 낮음 4)이 모두 검증해 보니 실제로 해당했고, 같은 PR에서 고쳤다.
- 같은 PR의 `pr-review`는 게시 기준을 넘은 지적이 0건이었다. Argon은 데이터가 바뀌면 드러날 경계 조건을 더 많이 잡았다.
- 비교는 `docs/devlog/2026-10-16-stack-from-source.md`의 "리뷰 비교"에 있다.

## 할 일
1. 다음 PR에서도 `pr-review`와 같이 돌려 한 번 더 비교한다.
2. 쓸 만하면 리뷰 지시를 파일로 두고, 클론부터 코멘트까지를 스크립트 하나로 줄인다. 그때 리뷰 루프(CLAUDE.md "브랜치와 PR")에 넣을지 정한다.

## 알아 둘 것
- 이 방법은 구독(AI Pro)이 끝나는 2026-12-29까지만 쓸 수 있다.
  - 그 뒤에도 쓰려면 Pro 이상을 다시 구독하거나 Vertex AI 종량제로 옮긴다.
  - AI Plus에는 Argon이 없다.
- Gemini CLI는 개인 구글 로그인을 거절한다("Antigravity로 이전" 안내). 그래서 Gemini CLI가 아니라 `agy`를 쓴다.
- PR이 열릴 때마다 자동으로 리뷰하려면 GitHub Actions와 Vertex AI가 필요하다. 지금은 하지 않는다.
- Pro 구독으로 Argon을 하루에 얼마나 쓸 수 있는지는 공개되지 않았다.

## 참고
- https://antigravity.google/docs/models/
