# UMCine · 9주차 Next.js 마이그레이션

기존 `umcine`의 영화 목록·검색·상세, 로그인·회원가입, 즐겨찾기, 평점·후기, 프로필 조회·수정 기능을 Next.js 16.4.6 App Router로 옮겼습니다. React Query와 Zustand는 유지했습니다.

## 실행

Node.js 22.15 이상(테스트의 `registerHooks` 사용), pnpm 12.4.1 기준입니다.

```powershell
cd "Hyunwoo/FE/9주차전용"
pnpm install
pnpm dev
```

기본 주소: http://localhost:3000. 다른 서버가 사용 중이면 터미널에 표시된 포트를 확인하세요.

비밀값은 저장소에 포함하지 않습니다. `.env.example`을 `.env.local`로 복사하고 기존 환경의 값을 새 변수명으로 채우세요.

| 변수 | 역할 |
| --- | --- |
| `TMDB_API_BASE_URL` | TMDB 주소, 기본값 `https://api.themoviedb.org/3` |
| `TMDB_ACCESS_TOKEN` | 서버 전용 TMDB 읽기 토큰 |
| `NEXT_PUBLIC_API_BASE_URL` | 기존 회원 API 서버 주소, 브라우저가 접근할 수 있어야 함 |

회원 API 서버의 CORS 허용 Origin에 실행 주소를 등록해야 합니다. 회원 서버가 실행되지 않으면 로그인·프로필·즐겨찾기·평점 API 요청이 실패합니다. 기존 토큰과 프로필 이미지 등은 동일한 Origin의 브라우저 저장소에서 유지됩니다. Vite와 Next.js의 포트가 다르면 저장소가 분리되므로 다시 로그인하세요.

## 구조

```text
src/app/                         Server Component 경로와 레이아웃
  page.tsx                       / (목록, ?page=2)
  search/page.tsx                 /search?query=검색어
  movies/[movieId]/page.tsx       /movies/27205
  login/page.tsx                  /login
  signup/page.tsx                 /signup
  (authenticated)/profile/       /profile, /profile/edit
  api/tmdb/[...path]/route.ts     서버에서 TMDB 호출
  providers.tsx                  React Query와 저장소 복원
src/screens/                     상태·이벤트를 사용하는 Client Component 화면
src/components/                  기존 공통 UI, 인증 가드
src/api/, hooks/, queries/       기존 API·React Query 로직
src/stores/                      Zustand persist (수동 hydration)
```

`src/pages`는 Next.js Pages Router 예약 폴더이므로 `src/screens`로 바꿨습니다. `loading.tsx`는 요청 시점의 `params`와 검색 파라미터를 위한 Suspense 경계를 제공합니다. 헤더와 푸터의 경로 읽기도 Suspense로 감쌌습니다. 루트 레이아웃과 푸터 콘텐츠는 Server Component이며 인터랙션이 있는 화면과 Provider, 인증 가드는 Client Component입니다.

Zustand는 `skipHydration`과 `useEffect` 내 `rehydrate()`를 사용합니다. 인증 가드는 복원이 끝난 다음 이동합니다. 실제 브라우저 저장소 접근은 `browser-storage.ts`가 서버 여부를 확인한 뒤 수행합니다. Canvas와 스크롤 등은 이벤트 핸들러 안에서만 실행합니다. 이 클라이언트 인증 가드는 화면 접근을 제어하며, 데이터 권한은 기존 백엔드의 토큰 검증이 담당합니다.

Vite 플러그인·TanStack Router·자동 생성 route tree를 제거했습니다. `next/link`, `useRouter`, `useSearchParams`, `usePathname`, 파일 기반 라우팅으로 교체했습니다. 예제 프로젝트의 Cache Components와 Tailwind Turbopack 설정을 가져왔고, 독립 실행을 위해 `turbopack.root`를 명시했습니다. TMDB는 내부 Route Handler를 경유하므로 토큰을 브라우저에 전달하지 않습니다.

## 검증

```powershell
pnpm build
pnpm typecheck
pnpm lint
pnpm test
pnpm start
```

검증 범위와 제한은 [미션 기록](docs/mission-record.md)에 정리했습니다. 기존 `<img>`를 유지해 이미지 최적화 권고 경고가 남아 있습니다. 회원 탈퇴 버튼은 원본과 동일하게 비활성 상태입니다.

참고: [Next.js 공식 Vite 마이그레이션 가이드](https://nextjs.org/docs/app/guides/migrating/from-vite), 설치된 `next/dist/docs`의 Client Component·Route Handler·Link 문서.
