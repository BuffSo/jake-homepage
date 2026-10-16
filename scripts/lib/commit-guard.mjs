// 커밋 가드 훅의 판정 (ADR-0006, scripts/hooks/guard-git-commit.mjs)
// 명령 문자열에서 실제로 git commit을 실행하는 자리만 찾고, 훅을 건너뛰는 옵션은 그 인자에서만 찾는다.
// 전에는 명령 전체에서 git-commit과 -n을 따로 찾아, sed -n이나 grep -n이 같은 명령에 있으면 커밋이 아니어도 막았다.
// 셸 문법을 모두 다루지는 않는다. 따옴표, 구간 구분자, 리다이렉트, 히어독, 감싸는 명령, bash -c만 본다.

// 구간 앞에서 건너뛰는 명령. RTK 훅이 git을 rtk git으로 바꾸므로 rtk도 넣는다.
const WRAPPERS = new Set(["rtk", "proxy", "command", "env", "exec", "time", "nohup"]);
const SHELLS = new Set(["bash", "sh", "zsh"]);
// 값을 다음 낱말로 받는 git 전역 옵션
const GIT_VALUE_OPTIONS = new Set(["-C", "-c", "--git-dir", "--work-tree", "--namespace", "--config-env"]);
// git commit에서 값을 받는 짧은 옵션. 같은 낱말의 뒤 글자나 다음 낱말이 값이다.
const COMMIT_VALUE_SHORT = new Set(["m", "F", "c", "C", "t"]);
// 값을 붙여서만 받는 짧은 옵션 (-uno, -Skey)
const COMMIT_ATTACHED_SHORT = new Set(["u", "S"]);
const COMMIT_VALUE_LONG = new Set([
  "--message",
  "--file",
  "--reuse-message",
  "--reedit-message",
  "--template",
  "--author",
  "--date",
  "--fixup",
  "--squash",
  "--cleanup",
  "--trailer",
  "--pathspec-from-file",
]);

const OPERATORS = ["&&", "||", ";", "|", "&", "(", ")"];

/** 낱말, 구간 구분자, 리다이렉트로 나눈다. 히어독 본문은 건너뛴다. */
function lex(input) {
  const tokens = [];
  const heredocs = [];
  let word = null;
  const flush = () => {
    if (word !== null) tokens.push({ type: "word", value: word });
    word = null;
  };

  let i = 0;
  while (i < input.length) {
    const c = input[i];
    if (c === "'") {
      const end = input.indexOf("'", i + 1);
      const stop = end < 0 ? input.length : end;
      word = (word ?? "") + input.slice(i + 1, stop);
      i = stop + 1;
    } else if (c === '"') {
      let j = i + 1;
      let text = "";
      while (j < input.length && input[j] !== '"') {
        if (input[j] === "\\" && j + 1 < input.length) {
          text += input[j + 1];
          j += 2;
        } else {
          text += input[j++];
        }
      }
      word = (word ?? "") + text;
      i = j + 1;
    } else if (c === "\\") {
      if (input[i + 1] !== "\n") word = (word ?? "") + (input[i + 1] ?? "");
      i += 2;
    } else if (c === " " || c === "\t") {
      flush();
      i++;
    } else if (c === "\n") {
      flush();
      tokens.push({ type: "op", value: "\n" });
      i = skipHeredocs(input, i + 1, heredocs.splice(0));
    } else if (input.startsWith("<<", i) && !input.startsWith("<<<", i)) {
      flush();
      const strip = input[i + 2] === "-";
      let j = i + (strip ? 3 : 2);
      while (input[j] === " " || input[j] === "\t") j++;
      let k = j;
      while (k < input.length && !/[\s;&|()<>]/.test(input[k])) k++;
      heredocs.push({ end: input.slice(j, k).replace(/['"\\]/g, ""), strip });
      i = k;
    } else if (c === ">" || c === "<") {
      flush();
      let j = i + 1;
      while (j < input.length && /[<>&|]/.test(input[j])) j++;
      tokens.push({ type: "redirect", value: input.slice(i, j) });
      i = j;
    } else {
      const op = OPERATORS.find((o) => input.startsWith(o, i));
      if (op) {
        flush();
        tokens.push({ type: "op", value: op });
        i += op.length;
      } else {
        word = (word ?? "") + c;
        i++;
      }
    }
  }
  flush();
  return tokens;
}

/** 히어독 본문을 끝 표시 줄까지 건너뛰고, 다음 명령이 시작하는 자리를 돌려준다 */
function skipHeredocs(input, start, heredocs) {
  let i = start;
  for (const { end, strip } of heredocs) {
    while (i < input.length) {
      const lineEnd = input.indexOf("\n", i) < 0 ? input.length : input.indexOf("\n", i);
      const line = input.slice(i, lineEnd);
      i = lineEnd + 1;
      if ((strip ? line.replace(/^\t+/, "") : line) === end) break;
    }
  }
  return i;
}

/** 구간마다 낱말 목록. 리다이렉트와 그 대상은 뺀다. */
function segments(command) {
  const result = [[]];
  let skipNext = false;
  for (const token of lex(command)) {
    if (token.type === "op") {
      result.push([]);
    } else if (token.type === "redirect") {
      skipNext = true;
    } else if (skipNext) {
      skipNext = false;
    } else {
      result.at(-1).push(token.value);
    }
  }
  return result.filter((words) => words.length > 0);
}

/** 명령에서 git commit을 실행하는 자리마다 commit 뒤의 인자 목록을 돌려준다 */
export function findCommits(command) {
  const commits = [];
  for (const words of segments(command)) {
    let i = 0;
    while (i < words.length && (WRAPPERS.has(words[i]) || /^[A-Za-z_]\w*=/.test(words[i]))) i++;
    const name = words[i]?.split("/").at(-1);
    if (SHELLS.has(name)) {
      // bash -c "…", bash -lc "…"의 문자열을 다시 검사한다
      const flag = words.findIndex((word, j) => j > i && /^-[a-z]*c[a-z]*$/.test(word));
      if (flag > 0 && words[flag + 1] !== undefined) commits.push(...findCommits(words[flag + 1]));
      continue;
    }
    if (name !== "git") continue;
    i++;
    while (i < words.length && words[i].startsWith("-")) i += GIT_VALUE_OPTIONS.has(words[i]) ? 2 : 1;
    if (words[i] === "commit") commits.push(words.slice(i + 1));
  }
  return commits;
}

/** git commit 인자에 훅을 건너뛰는 옵션(--no-verify, -n)이 있는지 */
export function skipsHooks(args) {
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === "--") return false;
    // git은 긴 옵션의 줄임(--no-veri)도 받는다
    if (arg.length >= "--no-veri".length && "--no-verify".startsWith(arg)) return true;
    if (arg.startsWith("--")) {
      if (COMMIT_VALUE_LONG.has(arg)) i++;
      continue;
    }
    if (!arg.startsWith("-") || arg === "-") continue;
    for (let k = 1; k < arg.length; k++) {
      const flag = arg[k];
      if (flag === "n") return true;
      if (COMMIT_ATTACHED_SHORT.has(flag)) break;
      if (COMMIT_VALUE_SHORT.has(flag)) {
        if (k === arg.length - 1) i++;
        break;
      }
    }
  }
  return false;
}
