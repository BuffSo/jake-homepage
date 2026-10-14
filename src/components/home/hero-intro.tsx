"use client";

import { useLayoutEffect, useRef, type RefObject } from "react";
import { PLAYED_KEY } from "./intro-script";

// 첫 화면 움직임 (docs/04-motion.md). 라이브러리 없이 Web Animations API로 다섯 박자를 재생한다.
// 서버가 그린 HTML이 마지막 장면이다. 재생할 때만 기술 층 위에 무대(조각, 관문, 사각형)를 얹고, 끝나면 무대를 지운다.
// 움직이는 속성은 transform과 opacity뿐이다. 실패하면 data-intro를 지워 마지막 장면을 남긴다.

/** 튀지 않는 스프링 감속. 임계 감쇠 스프링을 25점으로 샘플링했다. */
const SPRING =
  "linear(0, 0.055, 0.174, 0.31, 0.443, 0.56, 0.658, 0.738, 0.802, 0.851, 0.889, 0.918, 0.94, 0.956, 0.968, 0.977, 0.984, 0.989, 0.992, 0.995, 0.997, 0.998, 0.999, 1)";

/**
 * 키프레임 시각은 TOTAL(ms) 기준으로 적고, 실제로는 SPEED배 길이로 재생한다.
 * 끝을 알리는 데 한두 프레임이 더 들므로, 기준(데스크톱 3초, 모바일 2.5초)보다 조금 짧게 잡았다.
 */
const TOTAL = 3000;
const SPEED = { wide: 0.96, narrow: 0.8 };

type Step = [ms: number, value: string];

function played(): boolean {
  try {
    return sessionStorage.getItem(PLAYED_KEY) !== null;
  } catch {
    return true;
  }
}

function markPlayed() {
  try {
    sessionStorage.setItem(PLAYED_KEY, "1");
  } catch {
    // 저장소를 쓸 수 없으면 기록하지 않는다. 다음 방문에 한 번 더 재생될 뿐이다.
  }
}

/** 시드가 같으면 같은 배치가 나오는 난수. 스토리보드와 같은 식이다. */
function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

/** 재생을 시작하고, 멈추는 함수를 돌려준다. onEnd는 끝까지 재생했을 때만 부른다. */
function play(hero: HTMLElement, onEnd: () => void): () => void {
  const layers = hero.querySelector<HTMLElement>("[data-intro-layers]");
  const box = layers?.getBoundingClientRect();
  if (!layers || !box || box.width === 0) {
    delete hero.dataset.intro;
    return () => {};
  }

  hero.dataset.intro = "playing";
  const wide = matchMedia("(min-width: 64rem)").matches;
  const ease = CSS.supports("animation-timing-function", SPRING) ? SPRING : "cubic-bezier(0.2, 0.8, 0.2, 1)";
  const W = box.width;
  const H = box.height;
  const animations: Animation[] = [];

  // 무대는 기술 층 목록과 같은 자리, 같은 크기다.
  const stage = document.createElement("div");
  stage.setAttribute("aria-hidden", "true");
  Object.assign(stage.style, {
    position: "absolute",
    left: `${layers.offsetLeft}px`,
    top: `${layers.offsetTop}px`,
    width: `${W}px`,
    height: `${H}px`,
    overflow: "hidden",
    pointerEvents: "none",
  });
  layers.parentElement!.append(stage);

  const make = (style: Partial<CSSStyleDeclaration>, text = "", parent: HTMLElement = stage) => {
    const el = document.createElement("div");
    Object.assign(el.style, { position: "absolute", left: "0", top: "0" }, style);
    el.textContent = text;
    parent.append(el);
    return el;
  };

  // 원소마다 전체 시간축 위에 키프레임을 하나씩 둔다. 같은 속성을 여러 애니메이션이 덮어쓰지 않게 하기 위해서다.
  const track = (el: Element, prop: "transform" | "opacity", steps: Step[]) => {
    const all: Step[] = [[0, steps[0][1]], ...steps, [TOTAL, steps[steps.length - 1][1]]];
    const frames = all.map(([ms, value]) => ({ offset: Math.min(ms, TOTAL) / TOTAL, [prop]: value, easing: ease }));
    animations.push(el.animate(frames, { duration: TOTAL * (wide ? SPEED.wide : SPEED.narrow), fill: "both" }));
  };
  const at = (x: number, y: number, rest = "") => `translate(${x}px, ${y}px)${rest}`;

  // 박자 2의 관문 두 개: 데스크톱은 세로선, 모바일은 가로선
  const gate1 = wide ? 0.42 * W : 0.36 * H;
  const gate2 = wide ? 0.64 * W : 0.62 * H;
  for (const [pos, label] of [
    [gate1, "판단"],
    [gate2, "검증"],
  ] as const) {
    const line = wide
      ? make({ width: "0.125rem", height: `${0.9 * H}px`, transform: at(pos, 0.09 * H), transformOrigin: "top" })
      : make({ height: "0.125rem", width: `${W}px`, transform: at(0, pos), transformOrigin: "left" });
    line.style.background = "var(--fg)";
    const scale = wide ? "scaleY" : "scaleX";
    track(line, "transform", [[700, `${line.style.transform} ${scale}(0)`], [1050, `${line.style.transform} ${scale}(1)`]]);
    track(line, "opacity", [[1600, "1"], [1900, "0"]]);

    const text = make({ font: "500 0.8125rem/1 var(--font-mono)", color: "var(--fg)" }, label);
    text.style.transform = wide ? `${at(pos, 0)} translateX(-50%)` : `${at(W, pos)} translate(-100%, -150%)`;
    track(text, "opacity", [[750, "0"], [1000, "1"], [1600, "1"], [1900, "0"]]);
  }

  // 박자 3의 사각형
  const block = wide
    ? { x: 0.7 * W, y: 0.25 * H, w: 0.28 * W, h: 0.5 * H }
    : { x: 0.25 * W, y: 0.68 * H, w: 0.5 * W, h: 0.28 * H };
  const center = { x: block.x + block.w / 2, y: block.y + block.h / 2 };

  // 박자 1~3의 조각: 흘러들고, 관문에서 대부분 멈춰 흐려지고, 통과한 몇 개만 사각형으로 모인다
  const rnd = seeded(wide ? 11 : 23);
  const count = wide ? 24 : 14;
  const shades = ["var(--fg)", "var(--muted)", "var(--subtle)"];
  for (let i = 0; i < count; i++) {
    const kind = i % 6 === 0 ? "pass" : i % 8 === 3 ? "between" : "stop";
    const len = (wide ? 0.04 + rnd() * 0.12 : 0.05 + rnd() * 0.13) * W;
    const cross = wide ? (0.06 + rnd() * 0.9) * H : rnd() * 0.75 * W;
    const enter = wide ? (-0.1 + rnd() * 0.45) * W : (0.02 + rnd() * 0.26) * H;
    const r = rnd();
    const gap = wide ? 0.02 * W : 0.04 * H;
    const along = {
      pass: gate2 + gap + r * ((wide ? W - 0.04 * W - len : 0.95 * H) - gate2 - gap),
      between: gate1 + gap + r * Math.max(0, gate2 - gate1 - (wide ? len : 0) - 2 * gap),
      stop: Math.max(0, gate1 - gap - (wide ? len : 0) - r * (wide ? 0.2 * W : 0.25 * H)),
    }[kind];
    const pos = (a: number) => (wide ? at(a, cross) : at(cross, a));
    const from = wide ? enter - 0.35 * W : enter - 0.3 * H;

    const frag = make({
      width: `${len}px`,
      height: wide ? "0.375rem" : "0.3125rem",
      borderRadius: "0.1875rem",
      background: shades[Math.floor(rnd() * shades.length)],
    });
    // 들어오는 시작은 전체 300ms 안에서 엇갈리고, 관문으로 가는 움직임은 들어오기가 끝난 뒤에 시작한다.
    const enterAt = 60 + (i * 300) / count;
    const moveAt = Math.max(enterAt + 550, 880 + i * 6);
    const moveEnd = moveAt + 500;
    const moves: Step[] = [
      [enterAt, pos(from)],
      [enterAt + 550, pos(enter)],
      [moveAt, pos(enter)],
      [moveEnd, pos(along)],
    ];
    if (kind === "pass") moves.push([1550, pos(along)], [1950, `${at(center.x - len / 2, center.y)} scaleX(0.2)`]);
    track(frag, "transform", moves);

    const fade: Step[] = [
      [enterAt, "0"],
      [enterAt + 250, "1"],
    ];
    if (kind === "pass") fade.push([1550, "1"], [1950, "0"]);
    else fade.push([moveEnd - 150, "1"], [moveEnd + 100, kind === "stop" ? "0.25" : "0.55"], [1900, "0"]);
    track(frag, "opacity", fade);

    // 통과한 조각만 강조색이 된다. 색은 움직이지 않으므로 강조색 덮개의 opacity로 바꾼다.
    if (kind === "pass") {
      const skin = make({ inset: "0", borderRadius: "inherit", background: "var(--accent)" }, "", frag);
      track(skin, "opacity", [[moveEnd - 250, "0"], [moveEnd - 50, "1"]]);
    }
  }

  const blockEl = make({
    width: `${block.w}px`,
    height: `${block.h}px`,
    borderRadius: "1rem",
    background: "var(--accent)",
    transform: at(block.x, block.y),
  });
  track(blockEl, "transform", [[1600, `${at(block.x, block.y)} scale(0.6)`], [1950, at(block.x, block.y)]]);
  track(blockEl, "opacity", [[1600, "0"], [1800, "1"], [2050, "1"], [2150, "0"]]);

  // 박자 4: 사각형이 여섯 층으로 갈라진다. 조각 하나는 사각형의 한 줄에서 시작해 실제 층 자리로 간다.
  const items = [...layers.querySelectorAll<HTMLElement>("[data-intro-part='layer']")];
  items.forEach((item, j) => {
    const rect = item.getBoundingClientRect();
    const x = rect.left - box.left;
    const y = rect.top - box.top;
    const slice = make({
      width: `${rect.width}px`,
      height: `${rect.height}px`,
      borderRadius: getComputedStyle(item.querySelector("button") ?? item).borderRadius,
      background: "var(--accent)",
      transformOrigin: "0 0",
    });
    const part = { x: block.x, y: block.y + (j * block.h) / items.length, w: block.w, h: block.h / items.length };
    const folded = `${at(part.x, part.y)} scale(${part.w / rect.width}, ${part.h / rect.height})`;
    track(slice, "transform", [[2050, folded], [2600 + j * 30, `${at(x, y)} scale(1, 1)`]]);
    track(slice, "opacity", [[2040, "0"], [2060, "1"], [2650, "1"], [2850, "0"]]);
    // 기술 이름이 붙은 실제 층이 갈라진 조각 자리에 나타난다
    track(item, "opacity", [[2650, "0"], [2850, "1"]]);
  });

  // 박자 5: 둘째 줄과 보조 문장, 다시 보기, 증거 목록, 연락 링크가 제자리에 나타난다
  const parts = [...hero.querySelectorAll<HTMLElement>("[data-intro-part]:not([data-intro-part='layer'])")];
  parts.forEach((part, k) => {
    const t = 2500 + k * 50;
    track(part, "opacity", [[t, "0"], [t + 300, "1"]]);
    track(part, "transform", [[t, "translateY(0.5rem)"], [t + 300, "none"]]);
  });

  let stopped = false;
  const stop = () => {
    stopped = true;
    stage.remove();
    animations.forEach((a) => a.cancel());
  };
  Promise.all(animations.map((a) => a.finished)).then(
    () => {
      if (stopped) return;
      // data-intro를 먼저 지우고 애니메이션을 걷어 낸다. 마지막 키프레임이 원래 모습과 같아 화면이 튀지 않는다.
      delete hero.dataset.intro;
      stop();
      markPlayed();
      onEnd();
    },
    () => {},
  );
  return stop;
}

function start(hero: HTMLElement, stopRef: RefObject<(() => void) | null>) {
  stopRef.current?.();
  try {
    stopRef.current = play(hero, () => {
      stopRef.current = null;
    });
  } catch {
    stopRef.current = null;
    delete hero.dataset.intro;
  }
}

/** 다시 보기 버튼. 처음 방문했을 때의 재생도 이 컴포넌트가 맡는다. */
export function HeroIntro() {
  const ref = useRef<HTMLButtonElement>(null);
  const stopRef = useRef<(() => void) | null>(null);

  // 그리기 전에 시작해야 마지막 장면이 먼저 보였다가 사라지는 일이 없다.
  useLayoutEffect(() => {
    const hero = ref.current?.closest<HTMLElement>("[data-hero]");
    if (!hero) return;
    // 처음 받은 HTML은 인라인 스크립트가 pending을 붙인다. 다른 페이지에서 링크로 왔을 때는 여기서 조건을 본다.
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (hero.dataset.intro === "pending" || (!reduced && !played())) start(hero, stopRef);
    return () => {
      // 재생 중에 사라지면(개발 모드의 다시 마운트, 다른 페이지로 이동) 다음에 처음부터 재생한다.
      if (!stopRef.current) return;
      stopRef.current();
      stopRef.current = null;
      hero.dataset.intro = "pending";
    };
  }, []);

  return (
    <button
      ref={ref}
      type="button"
      onClick={() => {
        const hero = ref.current?.closest<HTMLElement>("[data-hero]");
        if (hero) start(hero, stopRef);
      }}
      className="h-11 shrink-0 cursor-pointer rounded-full border border-line px-4 text-[0.8125rem] hover:border-fg motion-reduce:hidden"
    >
      다시 보기
    </button>
  );
}
