# TODO: 커밋 가드 훅이 커밋이 아닌 명령도 막는 문제 고치기

> 작성: 2026-10-15
> 상태: **미착수**

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
