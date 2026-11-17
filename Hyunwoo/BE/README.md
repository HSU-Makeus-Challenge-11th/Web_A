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

## Swagger UI

서버 실행 후 `http://localhost:8080/swagger-ui.html`에 접속합니다.
OpenAPI JSON은 `http://localhost:8080/v3/api-docs`에서 확인할 수 있습니다.

1. `/auth/login`에서 로그인하고 응답의 `result.accessToken`을 복사합니다.
2. Swagger UI의 **Authorize**에서 토큰 문자열만 입력합니다. `Bearer `는 자동으로 붙습니다.
3. **즐겨찾기**, **영화 기록** 항목을 펼쳐 요청 예시와 HTTP 상태별 응답 예시를 확인합니다.
4. **Try it out → Execute**로 실제 요청을 보낼 수 있습니다. 등록·해제는 실제 DB에 반영됩니다.

공개 API에는 자물쇠가 없으며, 인증 API에는 `Authorization: Bearer {token}`이 필요합니다.
문서 경로만 인증 예외에 추가했고 `/favorites`, `/movie-records`는 계속 보호됩니다.
등록 요청에는 `memberId`를 보내지 않습니다.

제출 캡처: 8주차 API 5개가 보이는 화면, 한 API를 펼친 요청·성공/실패 응답 예시 화면.
예시는 문서에 정의한 샘플이며, 실제 호출 결과는 Execute 이후 Server response에서 확인합니다.

## 검증 명령어

```powershell
.\gradlew.bat test
.\gradlew.bat bootJar
```

테스트는 `src/test/resources/application.yaml`의 H2 메모리 DB와 테스트 전용 JWT 설정을 사용하므로
MySQL 및 별도의 환경변수 없이 실행할 수 있습니다. 실제 서버 실행에는 위 MySQL 설정이 필요합니다.

- `FavoriteServiceTest`: 즐겨찾기 등록·중복 방지 단위 테스트 2개
- `FavoriteApiTest`: 인증·등록·중복·여부 조회·문서 공개 통합 테스트 5개
- `RatingServiceTest`: 중복 등록 `409/RATING409_1`, 타인 평점 수정 `403/RATING403_1` 단위 테스트 2개
- `RatingApiTest`: 토큰 없는 등록 `401/AUTH401_2`, 인증된 등록 `201/COMMON201` 통합 테스트 2개
- `OpenApiDocumentationTests`: 문서 예시·스키마·공개/인증 구분 테스트 5개
- `MovieApplicationTests`: Spring 컨텍스트 로드 테스트 1개

평점 테스트만 실행하려면 다음 명령어를 사용합니다.

```powershell
.\gradlew.bat test --tests com.umc.movie.service.RatingServiceTest --tests com.umc.movie.controller.RatingApiTest
```

Swagger 문서만 검증하려면 다음 명령어를 사용합니다.

```powershell
.\gradlew.bat test --tests com.umc.movie.OpenApiDocumentationTests
```

