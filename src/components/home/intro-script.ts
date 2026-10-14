// 첫 화면 움직임의 시작 조건 (docs/04-motion.md 구현 방식). 서버 컴포넌트(hero.tsx)와 클라이언트(hero-intro.tsx)가 같이 쓴다.

/** 이번 방문에 이미 재생했는지 적어 두는 sessionStorage 키. 움직임 용량 검사(check:motion-size)도 이 문자열로 청크를 찾는다. */
export const PLAYED_KEY = "hero-intro-played";

/** JS가 이 시간 안에 재생을 시작하지 못하면 마지막 장면을 그대로 보여 준다. */
const FALLBACK_MS = 3000;

/**
 * 히어로 맨 앞에서 그리기 전에 실행된다. 움직임 줄이기가 아니고 이번 방문에 아직 재생하지 않았으면
 * 히어로에 data-intro를 붙여 글과 층을 숨겨 둔다. 숨기는 규칙은 globals.css에 있다.
 */
export const INTRO_SCRIPT = `(function(){var h=document.currentScript.parentElement;try{if(matchMedia("(prefers-reduced-motion: reduce)").matches||sessionStorage.getItem("${PLAYED_KEY}"))return;h.dataset.intro="pending";setTimeout(function(){if(h.dataset.intro==="pending"){delete h.dataset.intro;sessionStorage.setItem("${PLAYED_KEY}","1")}},${FALLBACK_MS})}catch(e){}})()`;
