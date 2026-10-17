// 푸터 (docs/02-ia.md 홈 5). "© 2026 소재희" 한 줄만 둔다(2026-10-17).
// 연락 링크는 첫 화면과 About에, 이 사이트의 저장소 링크는 /ai의 "이 사이트" 카드에 있다.
// 연도는 렌더 중에 계산하지 않는다. Cache Components에서 new Date()는 빌드 오류다.
export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-line print:hidden">
      <div className="mx-auto w-full max-w-7xl px-4 py-6 text-[0.8125rem] text-subtle md:px-16">
        <span>© 2026 소재희</span>
      </div>
    </footer>
  );
}
