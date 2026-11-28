export function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white">
      <div className="mx-auto flex h-14 w-full max-w-[1328px] items-center justify-end px-6">
        <p className="text-sm text-gray-600">
          This product uses the TMDB API but is not endorsed or certified by{' '}
          <a
            href="https://www.themoviedb.org"
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
