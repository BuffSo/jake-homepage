// 기술 층 짝 확인 (ADR-0010). 폴더를 걷는 부분과 판정하는 부분을 나눠, 판정은 파일 없이 테스트한다.

import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";

// 폴더 안의 파일을 상대 경로(/ 구분)로 모은다. skipDirs의 이름을 가진 폴더와 심볼릭 링크는 따라가지 않는다.
export function listFiles(root, skipDirs = []) {
  const skip = new Set(skipDirs);
  const out = [];
  const walk = (dir) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      if (entry.isDirectory()) {
        if (!skip.has(entry.name)) walk(path.join(dir, entry.name));
      } else if (entry.isFile()) {
        out.push(path.relative(root, path.join(dir, entry.name)).split(path.sep).join("/"));
      }
    }
  };
  walk(root);
  return out;
}

// 서비스 폴더 하나를 판정에 필요한 모양으로 읽는다. 파일 내용은 표지가 가리키는 파일만 필요할 때 읽는다.
export function readService(root, skipDirs) {
  const files = listFiles(root, skipDirs);
  const read = (rel) => readFileSync(path.join(root, rel), "utf8");
  const deps = new Set();
  for (const rel of files.filter((f) => f === "package.json" || f.endsWith("/package.json"))) {
    let pkg;
    try {
      pkg = JSON.parse(read(rel));
    } catch {
      continue;
    }
    for (const field of [pkg.dependencies, pkg.devDependencies]) for (const dep of Object.keys(field ?? {})) deps.add(dep);
  }
  return { files, deps, read };
}

function matches(marker, { files, deps, read }) {
  if (marker.dep) return deps.has(marker.dep);
  const hits = files.filter((f) => marker.file.test(f));
  if (!marker.text) return hits.length > 0;
  return hits.some((f) => marker.text.test(read(f)));
}

// 서비스 하나가 쓰는 기술 이름
export function detectTechs(service, techs) {
  return new Set(Object.entries(techs).filter(([, markers]) => markers.some((m) => matches(m, service))).map(([tech]) => tech));
}

// 층 데이터와 표지 판정을 견준다. detected는 { slug: Set(기술) }이고, 확인한 서비스만 담는다.
export function compareStack(layers, techs, detected) {
  const problems = [];
  const items = layers.flatMap((layer) => layer.items);
  const names = new Set(items.map((item) => item.name));
  for (const name of names) if (!techs[name]) problems.push(`${name}: 표지 설정에 없는 기술`);
  for (const name of Object.keys(techs)) if (!names.has(name)) problems.push(`${name}: 층에 없는 기술`);
  // 표지 설정에 없는 기술은 위에서 한 번만 알린다. 서비스마다 "표지가 없음"을 되풀이하지 않는다.
  for (const item of items.filter((i) => techs[i.name])) {
    for (const [slug, found] of Object.entries(detected)) {
      const used = item.usedBy.includes(slug);
      if (found.has(item.name) && !used) problems.push(`${item.name} · ${slug}: 코드에 표지가 있는데 층 데이터에 없음`);
      if (!found.has(item.name) && used) problems.push(`${item.name} · ${slug}: 층 데이터에 있는데 코드에 표지가 없음`);
    }
  }
  return problems;
}
