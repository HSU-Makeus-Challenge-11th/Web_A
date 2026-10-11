export function Footer() {
  return (
    <footer className="mt-auto border-t border-[#e5e5e5] bg-white px-4 py-5 text-xs text-[#6b7280] sm:px-6 sm:text-sm">
      <div className="mx-auto flex max-w-[1072px] items-center justify-end gap-[10px]">
        <img className="w-7 shrink-0" src="/images/logos/tmdb-logo.svg" alt="TMDB" />
        <p>This product uses the TMDB API but is not endorsed or certified by TMDB.</p>
      </div>
    </footer>
  );
}
