// 푸터 (docs/02-ia.md 홈 5). 연락 방법은 About에 있으므로 여기서는 반복하지 않는다.
// 연도는 렌더 중에 계산하지 않는다. Cache Components에서 new Date()는 빌드 오류다.
export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-line">
      <div className="mx-auto flex w-full max-w-7xl justify-between px-4 py-6 text-[0.8125rem] text-subtle md:px-16">
        <span>© 2026 소재희</span>
        <a href="https://github.com/BuffSo/jake-homepage" className="underline-offset-4 hover:underline">
          이 사이트의 소스
        </a>
      </div>
    </footer>
  );
}
