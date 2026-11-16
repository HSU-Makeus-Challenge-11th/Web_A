export function Footer() {
  return (
    <footer className="border-t border-[#e1e5ee] bg-white">
      <div className="mx-auto flex min-h-[56px] max-w-[1320px] items-center justify-end px-5 py-4">
        <p className="text-xs text-[#667085]">
          This product uses the TMDB API but is not endorsed or certified by{" "}
          <a
            href="https://www.themoviedb.org/"
            target="_blank"
            rel="noreferrer"
            className="underline"
          >
            TMDB
          </a>
          .
        </p>
      </div>
    </footer>
  );
}
