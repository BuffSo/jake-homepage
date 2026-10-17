// 원문 마크다운을 그릴 때 쓰는 플러그인 (src/components/markdown.tsx, ADR-0009).
// 의존성을 더하지 않으려고 트리를 직접 돈다. 사이트와 테스트(scripts/lib/)가 같이 쓴다.

/** 원문 HTML이 정한 style 속성을 버린다 (rehype). 모양은 globals.css의 .md가 정한다. */
export function rehypeDropStyle() {
  const walk = (node) => {
    if (node.properties) delete node.properties.style;
    node.children?.forEach(walk);
  };
  return (tree) => walk(tree);
}

/**
 * 문단 안의 줄바꿈을 그대로 줄바꿈으로 그린다 (remark).
 * 마크다운은 빈 줄 없이 바꾼 줄을 한 문단으로 붙인다. 이력서의 강점 다섯 줄과 동료 평가 인용이 한 줄로 이어지지 않게 한다.
 * mdast의 text만 바꾸므로 코드와 블록 사이 공백에는 닿지 않는다.
 */
export function remarkSoftBreaks() {
  const walk = (node) => {
    if (!node.children) return;
    node.children = node.children.flatMap((child) => {
      if (child.type !== "text" || !child.value.includes("\n")) {
        walk(child);
        return [child];
      }
      return child.value
        .split("\n")
        .flatMap((part, i) => [...(i > 0 ? [{ type: "break" }] : []), ...(part ? [{ type: "text", value: part }] : [])]);
    });
  };
  return (tree) => walk(tree);
}

/**
 * 절 제목(h2)에 정해 둔 id를 붙인다 (rehype). ids는 제목 글자 → id다.
 * 모르는 제목이면 예외를 던져 빌드를 멈춘다. 목차가 가리킬 곳이 없는 채로 배포되지 않게 한다.
 */
export function rehypeHeadingIds({ ids }) {
  const text = (node) => (node.type === "text" ? node.value : (node.children ?? []).map(text).join(""));
  const walk = (node) => {
    if (node.type === "element" && node.tagName === "h2") {
      const title = text(node).trim();
      if (!Object.hasOwn(ids, title)) throw new Error(`id를 정하지 않은 절 제목입니다: ${title}`);
      node.properties = { ...node.properties, id: ids[title] };
    }
    node.children?.forEach(walk);
  };
  return (tree) => walk(tree);
}

/**
 * 머리글 문단(label, 이력서의 **Peer Review**) 바로 뒤의 인용을 상자 하나(div.md-review)로 묶는다 (rehype).
 * 원문 글은 고치지 않고 묶음만 더한다. 모양은 globals.css의 .md-review가 정한다.
 * quotes({ id, text })는 그 글이 든 상자에 id를 붙인다. 다른 페이지에서 한 상자로 바로 보내려고 쓴다(홈 About의 동료 평가).
 * 글이 든 상자를 못 찾으면 예외를 던져 빌드를 멈춘다. 링크가 갈 곳이 없는 채로 배포되지 않게 한다.
 * 한 글이 여러 상자에 들어 있거나(id가 겹친다), 한 상자에 글이 둘 이상 걸려도(상자 하나에 id는 하나다) 멈춘다.
 */
export function rehypeReviews({ label, quotes = [] }) {
  const text = (node) => (node.type === "text" ? node.value : (node.children ?? []).map(text).join(""));
  return (tree) => {
    const found = new Set();
    const walk = (node) => {
      if (!node.children) return;
      const children = [];
      for (let i = 0; i < node.children.length; i++) {
        const child = node.children[i];
        // 머리글과 인용 사이의 줄바꿈 글자는 건너뛰고 다음 요소를 본다
        let j = i + 1;
        while (node.children[j]?.type === "text" && !node.children[j].value.trim()) j++;
        const next = node.children[j];
        const isLabel = child.type === "element" && child.tagName === "p" && text(child).trim() === label;
        if (!isLabel || next?.type !== "element" || next.tagName !== "blockquote") {
          walk(child);
          children.push(child);
          continue;
        }
        const box = { type: "element", tagName: "div", properties: { className: ["md-review"] }, children: [child, next] };
        const matches = quotes.filter((q) => text(next).includes(q.text));
        if (matches.length > 1) throw new Error(`한 상자에 글이 둘 이상 걸렸습니다: ${matches.map((q) => q.text).join(", ")}`);
        const [quote] = matches;
        if (quote) {
          if (found.has(quote.id)) throw new Error(`글이 든 상자가 둘 이상입니다: ${quote.text}`);
          box.properties.id = quote.id;
          found.add(quote.id);
        }
        children.push(box);
        i = j;
      }
      node.children = children;
    };
    walk(tree);
    const missing = quotes.filter((q) => !found.has(q.id));
    if (missing.length) throw new Error(`${label} 상자에서 찾지 못한 글입니다: ${missing.map((q) => q.text).join(", ")}`);
  };
}
