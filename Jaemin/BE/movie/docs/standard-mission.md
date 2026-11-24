# 6주차 Standard Mission

## API 명세

기본 주소: `http://localhost:8080`. POST/PATCH는 `Content-Type: application/json`을 사용합니다.

| 기능 | Method | 경로 | 정상 상태 | result |
| --- | --- | --- | --- | --- |
| 회원가입 | POST | /members | 201 | memberId, email, nickname |
| 평점 등록 | POST | /members/{memberId}/ratings | 201 | ratingId 숫자 |
| 평점 수정 | PATCH | /members/{memberId}/ratings/{ratingId} | 200 | null |
| 평점 삭제 | DELETE | /members/{memberId}/ratings/{ratingId} | 204 | 응답 본문 없음 |
| 회원 평점 조회 (기존) | GET | /members/{memberId}/ratings | 200 | 기존 배열 형식 유지 |

회원가입 요청:
```json
{"email":"umc@example.com","password":"Umc!1234","nickname":"moviefan"}
```
평점 등록 요청:
```json
{"movieId":550,"score":4,"comment":"좋아요"}
```
수정 요청 (score 필수, comment 생략 시 null로 변경):
```json
{"score":5,"comment":"수정 후기"}
```

이메일은 필수·이메일 형식·254자 이하, 닉네임은 공백 불가·2~12자입니다. 비밀번호는 대소문자·숫자·특수문자(!@#$%^&*)를 포함한 8자 이상입니다. 비밀번호는 bcrypt로 해시하여 저장하고 응답 DTO에서 제외합니다.
movieId는 양의 정수, score는 필수 정수 1~5, comment는 선택 500자 이하입니다. 소수 입력을 정수로 자동 절삭하지 않도록 Jackson 설정을 적용했습니다.

성공 응답:
```json
{"isSuccess":true,"code":"COMMON201","message":"회원가입에 성공했습니다.","result":{"memberId":1,"email":"umc@example.com","nickname":"moviefan"}}
```
실패 응답:
```json
{"isSuccess":false,"code":"COMMON4092","message":"이미 사용 중인 이메일입니다.","result":null}
```

| 실패 | HTTP | code |
| --- | --- | --- |
| DTO 검증 / 잘못된 JSON / 정수가 아닌 score | 400 | COMMON4001 |
| 이메일·닉네임·평점 사전 중복 검사 | 409 | COMMON4092 |
| DB 제약 위반 | 409 | COMMON4091 |
| 다른 회원의 평점 수정·삭제 | 403 | COMMON403 |
| 없는 회원으로 등록 / 없는 평점 수정·삭제 | 404 | COMMON404 |

이번 주차는 memberId를 직접 받습니다. 인증 기능은 다음 주차 범위입니다.

## 실행 및 검증

Java 21, MySQL의 `umc_movie` 스키마와 `DB_PW` 환경변수를 준비한 뒤 `./gradlew.bat bootRun`으로 실행합니다.
`ddl-auto: validate`이므로 기존 DB에는 member.email/nickname UNIQUE, rating(member_id,movie_id) UNIQUE, rating.member_id FK가 필요합니다. 엔티티 선언만으로 기존 DB를 변경하지 않습니다.

DB 없이 통합 검증: `./gradlew.bat --gradle-user-home .gradle-user test`
테스트는 H2 MySQL 모드에서 실제 컨트롤러·서비스·저장소를 실행합니다. 운영 MySQL 검증은 별도로 진행해야 합니다.

검증 범위: 회원가입 201, 해시 길이·비밀번호 일치, password 응답 제외, 중복 이메일·닉네임 409, 잘못된 이메일·닉네임·비밀번호 400, 평점 등록·수정·삭제, 중복 평점 409와 저장 개수, 소유권 403, 없는 평점 404, 없는 회원 등록 404, 별점·영화 ID·후기·JSON 검증 400, 삭제 204와 빈 본문. 서비스 사전 검사를 우회하여 repository에 중복 저장을 시도하는 DB UNIQUE 테스트도 포함합니다.

테스트가 생성하는 실제 요청/응답 기록:
- `build/mission-evidence/signup.txt`
- `build/mission-evidence/validation.txt`
- `build/mission-evidence/rating-create.txt`

이 기록은 MockMvc 통합 테스트 실행 결과이며 Postman 캡처는 아닙니다. 화면 캡처 제출 시 같은 요청을 Postman에서 보내고 상태 코드·요청 JSON·응답 JSON이 보이도록 캡처하세요. 생성된 memberId와 ratingId를 후속 요청에 사용합니다.

## 핵심 코드

- [회원가입 DTO](../src/main/java/com/umc/movie/dto/SignUpRequest.java)
- [회원가입 서비스](../src/main/java/com/umc/movie/service/MemberService.java)
- [bcrypt 설정](../src/main/java/com/umc/movie/config/PasswordConfig.java)
- [평점 컨트롤러](../src/main/java/com/umc/movie/controller/RatingController.java)
- [평점 서비스](../src/main/java/com/umc/movie/service/RatingService.java)
- [평점 저장소](../src/main/java/com/umc/movie/repository/RatingRepository.java)
- [평점 복합 UNIQUE](../src/main/java/com/umc/movie/entity/Rating.java)
- [공통 예외 처리](../src/main/java/com/umc/movie/controller/GlobalExceptionHandler.java)
- [통합 테스트](../src/test/java/com/umc/movie/MovieApplicationTests.java)

## 트러블슈팅 1건: 소수 별점 입력

**이슈:** score 필드가 Integer여도 JSON의 소수 값이 정수로 변환될 수 있어 정수만 허용한다는 API 약속을 충분히 보장하지 못했습니다.

**문제:** DTO의 @Min/@Max는 역직렬화 이후의 값에 적용되므로 이미 정수로 변환된 입력의 소수 여부를 확인할 수 없습니다.

**해결:** Jackson의 `accept-float-as-int: false`를 적용하고, JSON 변환 실패를 전역 예외 처리에서 COMMON4001 응답으로 변환했습니다. 통합 테스트에 score 4.5 입력 시 400 반환을 추가했습니다.

## 이번 실행 결과

2026-11-01 통합 테스트 5개 통과 (실패 0, 오류 0), BUILD SUCCESSFUL.
회원가입·검증 실패·평점 등록의 실제 요청/응답은 [evidence](evidence/)에 보관했습니다.
[Postman 요청 모음](standard-mission.postman_collection.json)을 Import하고 memberId/ratingId 변수를 실제 응답 값으로 변경해 사용할 수 있습니다. Postman 화면 캡처는 별도 촬영이 필요합니다.
