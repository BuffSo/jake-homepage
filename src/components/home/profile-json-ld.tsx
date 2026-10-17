import avatar from "@/assets/jake-avatar.png";
import { getHome } from "@/lib/content";
import { SITE_NAME, SITE_URL } from "@/lib/site-meta";

// 홈이 한 사람의 페이지라는 것을 검색엔진과 AI에 알리는 구조화 데이터 (docs/guide/SEO_검색과_공유_정책_20261017.md).
// Google이 한 사람이 중심인 페이지에 권하는 ProfilePage 형식이다. 화면에 보이는 사실만 담는다:
// 이름, 머리의 별칭(Jake), 사이트 주소, 연락의 GitHub, 머리의 아바타, 첫 화면 둘째 줄.
export function ProfileJsonLd() {
  const home = getHome();
  const data = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    url: SITE_URL,
    mainEntity: {
      "@type": "Person",
      name: SITE_NAME,
      alternateName: "Jake",
      url: SITE_URL,
      sameAs: [home.contact.github],
      image: new URL(avatar.src, SITE_URL).toString(),
      description: home.lines[0],
    },
  };
  // JSON.stringify는 HTML을 이스케이프하지 않으므로 <를 바꿔 script가 일찍 닫히지 않게 한다(Next JSON-LD 가이드).
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
