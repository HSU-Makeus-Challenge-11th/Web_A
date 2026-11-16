# 로그인 전용 페이지와 회원 API

`src/routes/(authenticated)/_auth.tsx`가 공통 로그인 검사와 `<Outlet />`을 제공합니다.
`_auth/profile` 아래에 내 정보와 수정 페이지가 있으며 URL은 `/profile`, `/profile/edit`로 유지됩니다.
토큰이 없어지면 이미 열린 페이지에서도 로그인 화면으로 이동합니다.

## 평점

로컬 `UMC 11기 백엔드/movie/movie` 프로젝트의 RatingController와 DTO를 기준으로 구현했습니다.

- `GET /members/{memberId}/ratings`: 공개 API, `RatingResponse[]`를 직접 반환합니다.
- 회원 번호: JwtUtil이 발급한 JWT의 `sub`를 읽습니다. 인증 검증은 서버에서 수행합니다.
- `POST /ratings`: `{ movieId, score, comment }`
- `PATCH /ratings/{ratingId}`: `{ score, comment }`
- `DELETE /ratings/{ratingId}`: 요청 본문 없음
- 별점: 1~5 정수, 후기: 최대 500자
- 변경 성공 후 회원 평점 쿼리를 무효화해 서버 결과를 다시 조회합니다.

## 즐겨찾기

현재 movie 백엔드에는 즐겨찾기 구현이 없습니다. 프론트는 아래 계약을 가정합니다.
실제 API가 추가되면 `src/api/favorites.ts`의 타입과 응답 추출 부분을 맞춰야 합니다.

| API | 요청 | 예상 응답 데이터 |
| --- | --- | --- |
| GET /favorites | 없음 | `{ result: [{ movieId: 42 }] }` |
| GET /favorites/42 | 없음 | `{ result: { isFavorite: true } }` |
| POST /favorites | `{ movieId: 42 }` | 성공 상태 코드 |
| DELETE /favorites/42 | 없음 | 성공 상태 코드 |

모든 즐겨찾기 요청은 Bearer 토큰을 사용합니다.
변경 성공 후 목록과 해당 영화의 상태 캐시를 함께 갱신합니다.
목록·검색·영화 상세·마이페이지 모두 서버 즐겨찾기를 사용하며 기존 로컬 북마크 저장소는 사용하지 않습니다.
비로그인 사용자의 북마크 클릭은 로그인 화면으로 연결됩니다.

## 확인

- `pnpm build`
- `pnpm lint`
- `pnpm test`: 실제 API 모듈에 fetch 모의 응답을 연결해 8개 요청의 경로·메서드·본문·인증 헤더, 실패 처리, 401 토큰 삭제와 JWT 회원 번호 추출을 검사합니다.

선택 미션의 캐시 갱신 비교와 mutationOptions 리팩터링 기록은 [optional-mission.md](./optional-mission.md)에 있습니다.

실서버 검증에는 localhost:8080 백엔드와 로그인 계정이 필요합니다.
즐겨찾기는 백엔드 API 구현도 필요합니다.
