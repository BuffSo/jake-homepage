// 커밋 가드 훅의 판정(scripts/lib/commit-guard.mjs) 테스트
// 막지 않아야 할 명령은 실제로 막혔던 것들이다 (docs/todo/20261015_03_todo_commit_guard_false_positive.md).

import assert from "node:assert/strict";
import { test } from "node:test";
import { findCommits, skipsHooks } from "./commit-guard.mjs";

const blocks = (command) => findCommits(command).some(skipsHooks);

test("커밋이 아닌 명령의 -n과 파일 이름의 git-commit은 커밋으로 보지 않는다", () => {
  assert.deepEqual(findCommits("sed -n 1,40p scripts/hooks/guard-git-commit.mjs"), []);
  assert.deepEqual(findCommits("cat scripts/hooks/guard-git-commit.mjs; sed -n 1p x"), []);
  assert.deepEqual(findCommits("git log -n 5 --grep commit"), []);
  assert.deepEqual(findCommits('echo "git commit -n"'), []);
});

test("커밋과 같은 명령에 있는 다른 명령의 -n은 막지 않는다", () => {
  assert.deepEqual(findCommits("git add . && git commit -q -m x"), [["-q", "-m", "x"]]);
  assert.equal(blocks("git commit -m x && grep -n foo f"), false);
  assert.equal(blocks("git commit -q -m x 2>&1 | tail -n 3"), false);
});

test("메시지 값에 든 n과 -n은 옵션으로 보지 않는다", () => {
  assert.equal(blocks('git commit -m "-n 옵션 설명"'), false);
  assert.equal(blocks("git commit -mnew"), false);
  assert.equal(blocks("git commit -uno -m x"), false);
  assert.equal(blocks("git commit --message=-n"), false);
});

test("히어독 메시지 본문은 명령으로 보지 않는다", () => {
  const command = ["git commit -q -F - <<'EOF'", "fix: x", "", "git commit -n is never used", "EOF", "git log -1"].join("\n");
  assert.deepEqual(findCommits(command), [["-q", "-F", "-"]]);
  assert.equal(blocks(command), false);
});

test("훅을 건너뛰는 커밋은 막는다", () => {
  assert.equal(blocks("git commit -n -m x"), true);
  assert.equal(blocks("git commit --no-verify"), true);
  assert.equal(blocks("git commit --no-veri -m x"), true);
  assert.equal(blocks("git -C /tmp/r commit -nm x"), true);
  assert.equal(blocks("git add . && git commit -an -m x"), true);
});

test("감싸는 명령과 bash -c 안의 커밋도 찾는다", () => {
  assert.equal(blocks("rtk git commit -n"), true);
  assert.equal(blocks("GIT_EDITOR=true git commit -n"), true);
  assert.equal(blocks('bash -c "git commit --no-verify"'), true);
  assert.equal(blocks("zsh -lc 'cd x && git commit -n'"), true);
});
