// 글꼴은 저장소에 두고 불러온다 (docs/03-design.md 타이포그래피).
// 영문과 숫자는 Geist, 한글은 Pretendard(./fonts/pretendard.css), 코드와 기술 이름은 Geist Mono.
// 글꼴 정의는 이 파일 한 곳에만 둔다. 부를 때마다 별도 글꼴 파일이 생기기 때문이다.

import localFont from "next/font/local";

// 첫 줄(가장 큰 요소)이 Geist라 미리 받는다.
export const geist = localFont({
  src: "./fonts/geist/Geist-Variable.woff2",
  weight: "100 900",
  variable: "--font-geist",
  display: "swap",
});

export const geistMono = localFont({
  src: "./fonts/geist/GeistMono-Variable.woff2",
  weight: "100 900",
  variable: "--font-geist-mono",
  display: "swap",
  preload: false,
});
