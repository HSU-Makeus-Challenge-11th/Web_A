# UMCine Backend · 8주차

Java 21, Spring Boot 3.5.0, Spring Data JPA, MySQL 기반 영화 평점 API입니다.
저장소 반영 경로는 `Hyunwoo/BE`입니다.

## 실행

1. JDK 21과 MySQL을 준비합니다.
2. `localhost:3306`에 `umc_movie` 데이터베이스와 엔티티에 맞는 `member`, `rating`, `favorite` 테이블을 준비합니다.
   `spring.jpa.hibernate.ddl-auto=validate`이므로 실행 시 테이블을 생성하지 않습니다.
3. 실행 환경에 다음 환경변수를 설정합니다.

| 변수 | 설명 |
| --- | --- |
| `DB_PASSWORD` | 로컬 MySQL `root` 비밀번호 |
| `JWT_SECRET` | HMAC 서명 비밀키, UTF-8 기준 최소 32바이트 |
| `JWT_ACCESS_EXPIRATION` | Access Token 유효기간(초) |

4. 프로젝트 루트에서 실행합니다.

```powershell
.\gradlew.bat bootRun
```

macOS/Linux에서는 `./gradlew bootRun`을 사용합니다. 기본 포트는 `8080`이며,
CORS 허용 출처는 `http://localhost:5173`입니다.
환경변수 파일을 자동으로 읽는 별도 라이브러리는 사용하지 않으므로 셸 또는 IDE 실행 설정에 값을 넣어야 합니다.

## API

| Method | Endpoint | 설명 | 인증 |
| --- | --- | --- | --- |
| POST | `/members` | 회원가입 | 불필요 |
| GET | `/members/email/{email}` | 이메일 중복 확인 | 불필요 |
| GET | `/members/nickname/{nickname}` | 닉네임 중복 확인 | 불필요 |
| POST | `/auth/login` | 로그인 및 JWT 발급 | 불필요 |
| GET | `/members/me` | 내 정보 조회 | 필요 |
| PATCH | `/members/me` | 내 닉네임 수정 | 필요 |
| GET | `/members/{memberId}/ratings` | 회원별 평점 조회 | 불필요 |
| POST | `/ratings` | 평점 등록 | 필요 |
| PATCH | `/ratings/{ratingId}` | 본인 평점 수정 | 필요 |
| DELETE | `/ratings/{ratingId}` | 본인 평점 삭제 | 필요 |
| POST | `/favorites` | 즐겨찾기 등록 | 필요 |
| GET | `/favorites` | 내 즐겨찾기 최신순 조회 | 필요 |
| GET | `/favorites/{movieId}` | 즐겨찾기 여부 조회 | 필요 |
| DELETE | `/favorites/{movieId}` | 즐겨찾기 해제 | 필요 |
| POST | `/movie-records` | 평점과 선택적 즐겨찾기 저장 | 필요 |

인증 요청에는 `Authorization: Bearer <accessToken>` 헤더를 사용합니다.
회원 비밀번호는 BCrypt로 저장하며, 이메일·닉네임과 회원별 영화 평점에 중복 제약이 있습니다.
즐겨찾기와 영화 기록 요청은 URL·바디·쿼리로 `memberId`를 받지 않고 토큰에서 회원을 식별합니다.
즐겨찾기 등록 바디는 `{"movieId":550}`이며, 같은 회원의 중복 등록은 `409 FAVORITE409_1`입니다.
미등록 영화의 여부 조회는 `200`과 `result.isFavorite: false`, 없는 즐겨찾기 해제는 `404 FAVORITE404_1`을 반환합니다.
즐겨찾기 테이블에는 `(member_id, movie_id)` 복합 UNIQUE 제약이 필요합니다.

영화 기록 요청 예시:

```json
{
  "movieId": 238,
  "score": 5,
  "comment": "다시 보고 싶은 영화입니다.",
  "addToFavorites": true
}
```

`MovieRecordService.create()`의 `@Transactional` 안에서 평점과 즐겨찾기를 저장합니다.
`addToFavorites: true`이면 두 저장이 함께 성공하거나 실패 시 함께 롤백됩니다.
성공 응답의 `result.rating`과 `result.favorite`를 확인합니다.
`false`이면 평점만 저장하고 `result.favorite`는 `null`입니다.

## 검증

```powershell
.\gradlew.bat test
.\gradlew.bat bootJar
```

현재 테스트는 Spring 컨텍스트 로드 테스트 1개입니다.
테스트에도 MySQL 스키마 및 위 환경변수가 필요합니다.
