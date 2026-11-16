# 미션 기록

<details open>
<summary>필수 미션 — TanStack Router → Next.js 마이그레이션</summary>

기존 UMCine의 기능과 UI를 유지하면서 Next.js 16.4.6 App Router로 옮겼습니다.

### 핵심 코드

**1. 파일 기반 라우팅과 비동기 params**

```tsx
// src/app/movies/[movieId]/page.tsx (Server Component)
import { MovieDetailPage } from "@/screens/movies/movie-detail-page";

export default async function Page({ params }: {
  params: Promise<{ movieId: string }>;
}) {
  const { movieId } = await params;
  return <MovieDetailPage movieId={movieId} />;
}
```

`src/app/loading.tsx`가 Suspense 경계를 만들어 Cache Components 환경에서 요청 시점의 params를 읽을 수 있습니다. 기존 `src/pages`는 Pages Router로 인식되어 `src/screens`로 변경했습니다.

**2. Next.js 전용 탐색 API**

```tsx
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

const router = useRouter();
const searchParams = useSearchParams();
const requestedPage = Number(searchParams.get("page"));
const page = Number.isInteger(requestedPage)
  && requestedPage >= 1 && requestedPage <= TMDB_MAX_PAGE ? requestedPage : 1;

router.push(nextPage === 1 ? "/" : `/?page=${nextPage}`);
// JSX
<Link href={`/movies/${movie.id}`}>{movie.title}</Link>
```

`createFileRoute`, `RouterProvider`, `Outlet`, `Navigate`, TanStack의 `Link`, `useNavigate`, `useSearch`, `useParams`, `useMatchRoute`를 모두 제거했습니다. 프로필 인증은 `(authenticated)/layout.tsx`와 `AuthGuard`, 로그인 사용자 이동은 `router.replace`로 구현했습니다.

**3. 서버/클라이언트 경계와 저장소 복원**

```tsx
// src/app/providers.tsx
"use client";
const [queryClient] = useState(() => new QueryClient({
  defaultOptions: { queries: { staleTime: 60_000 } },
}));
useEffect(() => {
  void useAuthStore.persist.rehydrate();
  void useBookmarkStore.persist.rehydrate();
  void useDisplayStore.persist.rehydrate();
  void useProfileStore.persist.rehydrate();
}, []);
```

각 persist store는 `skipHydration: true`를 설정합니다. `browserStorage`는 `typeof window`를 검사한 후 저장소에 접근하며, `AuthGuard`는 `useSyncExternalStore`로 hydration 완료를 확인한 뒤 리다이렉트합니다. Canvas와 스크롤은 이벤트 처리 안에서만 실행합니다. 루트 레이아웃은 Server Component, 상태·이벤트를 사용하는 화면은 Client Component로 나눴습니다.

**4. 라이브러리 및 환경 설정**

Vite·TanStack Router 플러그인을 제거하고 Next.js의 TypeScript·ESLint·Tailwind Turbopack 설정을 적용했습니다. `VITE_API_BASE_URL`은 `NEXT_PUBLIC_API_BASE_URL`로 바꿨습니다. TMDB 토큰은 서버 전용 `TMDB_ACCESS_TOKEN`으로 옮기고 `/api/tmdb/[...path]` Route Handler에서만 사용합니다.

### 최종 확인 결과

- 프로덕션 빌드 성공: 목록, 검색, 동적 상세, 로그인, 회원가입, 프로필 및 수정 경로 생성.
- 자동 테스트 18개 통과: 기존 회원 API·평점·즐겨찾기·캐시 동작 16개 + 브라우저 전역 없이 저장소 복원 + TMDB 서버 경로·인증 헤더·오류 전달 검사.
- 브라우저 확인: 실제 TMDB 영화 목록 표시 → 영화 상세 이동 및 데이터 표시 성공.
- 브라우저 확인: `인셉션` 검색 시 URL의 `query` 반영 및 결과 3편 표시 성공.
- 브라우저 확인: 비로그인 상태에서 내 정보 클릭 시 `/login` 이동, 로그인 화면의 푸터 숨김 성공.
- 확인한 브라우저 콘솔 오류·경고 없음.
- ESLint 오류 없음. 기존 `<img>` 사용으로 이미지 최적화 권고 경고 14개가 남음.
- 실제 계정 로그인·가입·회원 정보 변경·즐겨찾기·평점 쓰기는 수행하지 않았으며, 해당 API 계약과 캐시 동작은 모의 전송 기반 자동 테스트로 확인함. 실제 회원 기능에는 기존 백엔드 실행과 CORS 설정이 필요함.

</details>
