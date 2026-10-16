# TODO: 커밋 가드 훅이 커밋이 아닌 명령도 막는 문제 고치기

> 작성: 2026-10-15 · 고침: 2026-10-17
> 상태: **완료** (2026-10-17, 브랜치 `fix/commit-guard`)

## 문제

`scripts/hooks/guard-git-commit.mjs`(Claude Code PreToolUse 훅, ADR-0006)는 명령 전체 문자열에서 다음을 따로 찾습니다.

1. `git`과 `commit`이 같은 구간(`;`, `&`, `|`, 줄바꿈 사이)에 있는지
2. 어디든 `-n` 플래그가 있는지

그래서 커밋이 아닌 명령도 막힙니다.

- `git commit ... && grep -n ...`: 커밋 자체에는 `-n`이 없는데 막힘
- `sed -n 1,40p scripts/hooks/guard-git-commit.mjs`: 파일 이름의 `git-commit`이 1번에 걸리고 `sed -n`이 2번에 걸림

## 고칠 방향

- 명령을 구간으로 나눈 뒤, 첫 낱말이 `git`이고 그 뒤 하위 명령이 `commit`인 구간만 검사합니다(`git -C 경로 commit`도 포함).
- `-n`, `--no-verify`는 그 구간의 인자에서만 찾습니다.
- 판정 함수를 `scripts/lib/`로 빼서 위 두 예와 진짜 `git commit -n`, `git commit --no-verify`를 테스트로 고정합니다.

동작이 바뀌는 수정이라 feature 브랜치와 PR로 합칩니다.

## 고친 것

- 판정을 `scripts/lib/commit-guard.mjs`로 뺐습니다. 명령을 낱말과 구간으로 나눠 실제로 `git commit`을 실행하는 자리를 찾고, `-n`과 `--no-verify`는 그 커밋의 인자에서만 찾습니다.
  - 따옴표 안의 글자, 리다이렉트 대상, 히어독 메시지 본문은 명령으로 보지 않습니다.
  - `rtk`, `env` 같은 감싸는 명령, `변수=값`, git 전역 옵션(`-C 경로` 등)은 건너뛰고 봅니다.
  - `bash -c "…"` 같은 문자열은 그 안을 다시 검사합니다.
  - 메시지 값의 글자(`-mnew`, `-m "-n …"`)와 값을 붙여 받는 옵션(`-uno`)은 옵션으로 보지 않습니다. `--no-veri` 같은 줄임은 막습니다.
- 위 두 예와 실제로 막혔던 명령, 막아야 할 명령을 `scripts/lib/commit-guard.test.mjs`에 고정했습니다.
- AI 서명 검사는 히어독 메시지 본문에도 있을 수 있어서, 커밋이 있으면 지금처럼 명령 전체에서 찾습니다.
- 셸 문법을 모두 다루지는 않습니다. 함수, 별칭, `eval`, `xargs`로 부르는 커밋은 찾지 못합니다. 이런 커밋도 git의 pre-commit 훅(`.githooks/pre-commit`)은 돕니다.
