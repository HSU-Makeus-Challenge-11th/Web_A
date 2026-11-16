"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return <main className="p-10 text-center"><p>페이지를 불러오지 못했어요.</p><button onClick={reset}>다시 시도</button></main>;
}
