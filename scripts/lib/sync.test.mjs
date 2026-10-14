import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, realpathSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { after, describe, test } from "node:test";
import { applyTransforms, buildOutputs, dropLine, dropTableColumn, MANIFEST, replaceLine, SyncError } from "./sync.mjs";

// 전화번호 모양의 값이 파일에 그대로 있으면 민감정보 검사에 걸리므로 실행할 때 만든다.
const PHONE = ["010", "0000", "0000"].join("-");

const RESUME = [
  "# 이름",
  "",
  "| 전화번호 | 이메일 | GitHub |",
  "| --- | --- | --- |",
  `| ${PHONE} | buffso@naver.com | https://github.com/BuffSo |`,
  "",
  "※ 정부 과제 안내",
  "※ 태니지먼트 안내",
  "",
].join("\n");

const CONFIG = {
  outputDir: "content/synced",
  files: [
    {
      source: "이력서.md",
      output: "resume.md",
      transforms: [
        { type: "drop-table-column", header: "전화번호" },
        { type: "drop-line", startsWith: "※ 태니지먼트" },
      ],
    },
  ],
};

const tempDirs = [];
after(() => tempDirs.forEach((d) => rmSync(d, { recursive: true, force: true })));

function tempDir(prefix) {
  const dir = realpathSync(mkdtempSync(path.join(tmpdir(), prefix)));
  tempDirs.push(dir);
  return dir;
}

function makeCareerRepo(files) {
  const dir = tempDir("career-");
  for (const [name, content] of Object.entries(files)) writeFileSync(path.join(dir, name), content);
  const git = (...args) =>
    execFileSync(
      "git",
      ["-C", dir, "-c", "user.name=test", "-c", "user.email=test@example.com", "-c", "commit.gpgsign=false", ...args],
      { stdio: "ignore" },
    );
  git("init", "-q");
  git("add", ".");
  git("commit", "-q", "-m", "init");
  return dir;
}

describe("dropTableColumn", () => {
  test("머리글, 구분선, 값까지 열을 통째로 지운다", () => {
    const out = dropTableColumn(RESUME, "전화번호");
    assert.ok(out.includes("| 이메일 | GitHub |"));
    assert.ok(out.includes("| --- | --- |"));
    assert.ok(out.includes("| buffso@naver.com | https://github.com/BuffSo |"));
    assert.ok(!out.includes(PHONE));
    assert.ok(!out.includes("전화번호"));
  });

  test("들여쓰기를 지키고, 그 머리글이 없는 표는 건드리지 않는다", () => {
    const text = ["  | 전화번호 | 이메일 |", "  | --- | --- |", `  | ${PHONE} | a@example.com |`, "", "| 이름 | 값 |", "|---|---|", "| a | b |"].join("\n");
    const out = dropTableColumn(text, "전화번호");
    assert.deepEqual(out.split("\n"), ["  | 이메일 |", "  | --- |", "  | a@example.com |", "", "| 이름 | 값 |", "|---|---|", "| a | b |"]);
  });

  test("남는 칸이 없으면 그 표의 줄을 지운다", () => {
    const text = ["앞", "| 전화번호 |", "| --- |", `| ${PHONE} |`, "뒤"].join("\n");
    assert.equal(dropTableColumn(text, "전화번호"), "앞\n뒤");
  });

  test("머리글을 찾지 못하면 멈춘다", () => {
    assert.throws(() => dropTableColumn("| 이메일 |\n| --- |\n| a |", "전화번호"), SyncError);
  });

  test("구분선이 없는 줄은 표 머리글로 보지 않는다", () => {
    assert.throws(() => dropTableColumn(`| 전화번호 |\n| ${PHONE} |`, "전화번호"), SyncError);
  });
});

describe("dropLine", () => {
  test("prefix로 시작하는 줄만 지운다", () => {
    const out = dropLine(RESUME, "※ 태니지먼트");
    assert.ok(out.includes("※ 정부 과제 안내"));
    assert.ok(!out.includes("태니지먼트"));
  });

  test("찾는 줄이 없으면 멈춘다", () => {
    assert.throws(() => dropLine("본문", "※ 태니지먼트"), SyncError);
  });
});

describe("replaceLine", () => {
  test("prefix로 시작하는 줄을 바꾸고 들여쓰기는 지킨다", () => {
    const out = replaceLine("앞\n  - 옛 문구 뒷부분\n뒤", "- 옛 문구", "- 새 문구");
    assert.equal(out, "앞\n  - 새 문구\n뒤");
  });

  test("맞는 줄이 없거나 두 줄 이상이면 멈춘다", () => {
    assert.throws(() => replaceLine("본문", "- 옛 문구", "- 새 문구"), SyncError);
    assert.throws(() => replaceLine("- 옛 문구 1\n- 옛 문구 2", "- 옛 문구", "- 새 문구"), SyncError);
  });
});

test("알 수 없는 변환이면 멈춘다", () => {
  assert.throws(() => applyTransforms("본문", [{ type: "replace-all" }]), SyncError);
});

describe("buildOutputs", () => {
  test("전화번호와 지정한 줄을 지우고, manifest에는 원본 해시와 경로를 넣지 않는다", () => {
    const careerDir = makeCareerRepo({ "이력서.md": RESUME });
    const { outputs, findings, state } = buildOutputs({ careerDir, config: CONFIG, privateTerms: [] });

    assert.deepEqual(findings, []);
    assert.ok(!outputs.get("resume.md").includes(PHONE));
    assert.ok(!outputs.get("resume.md").includes("태니지먼트"));

    const manifestText = outputs.get(MANIFEST);
    assert.deepEqual(JSON.parse(manifestText), {
      source: { commit: state.commit, dirty: false },
      files: [{ output: "resume.md", transforms: ["drop-table-column 전화번호", "drop-line ※ 태니지먼트"] }],
    });
    assert.ok(!manifestText.includes(careerDir));
  });

  test("표 밖에 남은 전화번호는 검사에 걸린다", () => {
    const careerDir = makeCareerRepo({ "이력서.md": `${RESUME}\n- 연락처 ${PHONE}\n` });
    const { findings } = buildOutputs({ careerDir, config: CONFIG, privateTerms: [] });
    assert.deepEqual(
      findings.map((f) => f.id),
      ["phone-mobile"],
    );
    assert.ok(!findings[0].shown.includes(PHONE));
  });

  test("비공개 금지어가 남으면 검사에 걸린다", () => {
    const careerDir = makeCareerRepo({ "이력서.md": `${RESUME}\n회사 가나다\n` });
    const { findings } = buildOutputs({ careerDir, config: CONFIG, privateTerms: ["가나다"] });
    assert.deepEqual(
      findings.map((f) => f.id),
      ["private-term#1"],
    );
  });

  test("원본에 커밋하지 않은 변경이 있으면 멈추고, --allow-dirty면 manifest에 남긴다", () => {
    const careerDir = makeCareerRepo({ "이력서.md": RESUME });
    writeFileSync(path.join(careerDir, "이력서.md"), `${RESUME}\n추가\n`);

    assert.throws(() => buildOutputs({ careerDir, config: CONFIG, privateTerms: [] }), /커밋하지 않은 변경/);
    const { outputs } = buildOutputs({ careerDir, config: CONFIG, privateTerms: [], allowDirty: true });
    assert.equal(JSON.parse(outputs.get(MANIFEST)).source.dirty, true);
  });

  test("허용 목록 밖의 파일 변경은 원본 상태에 영향을 주지 않는다", () => {
    const careerDir = makeCareerRepo({ "이력서.md": RESUME, "기타.md": "다른 문서" });
    writeFileSync(path.join(careerDir, "기타.md"), "고친 다른 문서");
    const { state } = buildOutputs({ careerDir, config: CONFIG, privateTerms: [] });
    assert.deepEqual(state.dirty, []);
  });

  test("원본 파일이 없으면 멈추고, 메시지에 로컬 경로를 넣지 않는다", () => {
    const careerDir = makeCareerRepo({ "다른.md": RESUME });
    assert.throws(
      () => buildOutputs({ careerDir, config: CONFIG, privateTerms: [] }),
      (e) => e instanceof SyncError && e.message.includes("이력서.md") && !e.message.includes(careerDir),
    );
  });

  test("링크로 원본 저장소 밖을 가리키면 멈춘다", () => {
    const outside = tempDir("outside-");
    writeFileSync(path.join(outside, "secret.md"), "밖의 문서");
    const careerDir = makeCareerRepo({ "README.md": "x" });
    symlinkSync(path.join(outside, "secret.md"), path.join(careerDir, "이력서.md"));
    assert.throws(() => buildOutputs({ careerDir, config: CONFIG, privateTerms: [] }), /원본 저장소 밖/);
  });

  test("허용 목록에 상대 경로가 아닌 값이 있으면 아무것도 읽기 전에 멈춘다", () => {
    const careerDir = makeCareerRepo({ "이력서.md": RESUME });
    const bad = (source) => ({ ...CONFIG, files: [{ ...CONFIG.files[0], source }] });
    assert.throws(() => buildOutputs({ careerDir, config: bad("../이력서.md"), privateTerms: [] }), SyncError);
    assert.throws(() => buildOutputs({ careerDir, config: bad("/etc/hosts"), privateTerms: [] }), SyncError);
  });

  test("출력 이름이 manifest와 겹치면 멈춘다", () => {
    const careerDir = makeCareerRepo({ "이력서.md": RESUME });
    const config = { ...CONFIG, files: [{ ...CONFIG.files[0], output: MANIFEST }] };
    assert.throws(() => buildOutputs({ careerDir, config, privateTerms: [] }), SyncError);
  });
});

describe("허용 목록 밖은 읽지 않는다", () => {
  test("같은 폴더의 다른 파일은 결과에 들어가지 않는다", () => {
    const careerDir = makeCareerRepo({ "이력서.md": RESUME });
    mkdirSync(path.join(careerDir, "비공개"));
    writeFileSync(path.join(careerDir, "비공개", "메모.md"), "비공개");
    const { outputs } = buildOutputs({ careerDir, config: CONFIG, privateTerms: [] });
    assert.deepEqual([...outputs.keys()], ["resume.md", MANIFEST]);
  });
});
