package com.umc.movie.config;

import io.swagger.v3.oas.models.Operation;
import io.swagger.v3.oas.models.media.Content;
import io.swagger.v3.oas.models.media.MediaType;
import io.swagger.v3.oas.models.media.Schema;
import io.swagger.v3.oas.models.examples.Example;
import io.swagger.v3.oas.models.responses.ApiResponse;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import org.springdoc.core.customizers.OpenApiCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.util.AntPathMatcher;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Configuration
public class OpenApiConfig {

    private static final String BEARER = "bearerAuth";
    private static final String JSON = "application/json";

    @Bean
    public OpenApiCustomizer movieApiDocumentation() {
        return api -> {
            AntPathMatcher matcher = new AntPathMatcher();
            api.getPaths().forEach((path, item) -> item.readOperationsMap().forEach((method, operation) -> {
                boolean isPublic = WebConfig.PUBLIC_PATHS.stream().anyMatch(pattern -> matcher.match(pattern, path));
                operation.setSecurity(isPublic ? List.of() : List.of(new SecurityRequirement().addList(BEARER)));
                String authDescription = isPublic ? "공개 API: 토큰 불필요."
                        : "인증 필요: Authorization: Bearer {token}.";
                operation.setDescription(authDescription + "\n\n"
                        + (operation.getDescription() == null ? "" : operation.getDescription()));
                if (!isPublic) {
                    failure(operation, "401", "토큰 없음·유효하지 않음·만료", "AUTH401_2", "로그인이 필요한 요청입니다.");
                    errorExample(operation, "401", "AUTH401_3", "유효하지 않은 토큰입니다.");
                    errorExample(operation, "401", "AUTH401_4", "토큰이 만료되었습니다. 다시 로그인해주세요.");
                }

                switch (method.name() + " " + path) {
                    case "POST /ratings" -> {
                        describe(operation, "평점", "영화에 평점 등록");
                        requestExample(operation, Map.of("movieId", 550, "score", 5, "comment", "다시 보고 싶은 영화입니다."));
                        success(operation, "201", "평점을 등록했습니다.", rating());
                        validation(operation, "별점은 5점 이하여야 합니다.");
                        memberNotFound(operation);
                        failure(operation, "409", "RATING409_1: 같은 영화에 중복 평점 / COMMON4091: DB 중복 제약 위반",
                                "RATING409_1", "이미 이 영화에 평점을 남기셨습니다.");
                        errorExample(operation, "409", "COMMON4091", "이미 존재하는 데이터입니다.");
                    }
                    case "PATCH /ratings/{ratingId}", "DELETE /ratings/{ratingId}" -> {
                        boolean update = "PATCH".equals(method.name());
                        describe(operation, "평점", update ? "내가 작성한 평점 수정" : "내가 작성한 평점 삭제");
                        if (update) {
                            requestExample(operation, Map.of("score", 5, "comment", "다시 보고 싶은 영화입니다."));
                            validation(operation, "별점은 5점 이하여야 합니다.");
                        }
                        success(operation, "200", update ? "평점을 수정했습니다." : "평점을 삭제했습니다.", update ? rating() : null);
                        failure(operation, "403", "RATING403_1: 다른 회원이 작성한 평점",
                                "RATING403_1", "본인이 작성한 평점만 수정하거나 삭제할 수 있습니다.");
                        failure(operation, "404", "RATING404_1: 평점 없음", "RATING404_1", "해당 평점을 찾을 수 없습니다.");
                    }
                    case "GET /members/{memberId}/ratings" -> {
                        describe(operation, "평점", "회원이 작성한 평점 목록 조회 (최신 등록순)");
                        // 이 공개 API는 ApiResponse 포장 없이 배열을 직접 반환합니다.
                        operation.getResponses().get("200").setDescription("회원의 평점 목록. 평점이 없으면 빈 배열을 반환합니다.");
                        responseMedia(operation, "200").addExamples("성공", new Example().value(List.of(rating())))
                                .addExamples("빈 목록", new Example().value(List.of()));
                        memberNotFound(operation);
                    }
                    case "GET /members/me", "PATCH /members/me" -> {
                        boolean update = "PATCH".equals(method.name());
                        describe(operation, "회원", update ? "내 닉네임 수정" : "내 정보 조회");
                        if (update) {
                            requestExample(operation, Map.of("nickname", "영화조아"));
                            validation(operation, "닉네임은 2자 이상 12자 이하여야 합니다.");
                            failure(operation, "409", "MEMBER409_1: 닉네임 중복 / COMMON4091: DB 중복 제약 위반",
                                    "MEMBER409_1", "이미 사용 중인 닉네임입니다.");
                            errorExample(operation, "409", "COMMON4091", "이미 존재하는 데이터입니다.");
                        }
                        success(operation, "200", update ? "회원 정보를 수정했습니다." : "회원 정보를 조회했습니다.",
                                Map.of("email", "challenger@umc.com", "nickname", "영화조아", "createdAt", "2026-11-16T15:00:00"));
                        memberNotFound(operation);
                    }
                    case "POST /favorites" -> {
                        describe(operation, "즐겨찾기", "즐겨찾기 등록");
                        requestExample(operation, Map.of("movieId", 550));
                        success(operation, "201", "즐겨찾기를 등록했습니다.", favorite());
                        validation(operation, "영화 ID는 양수여야 합니다.");
                        failure(operation, "404", "MEMBER404_1: 회원 없음", "MEMBER404_1", "해당 회원을 찾을 수 없습니다.");
                        favoriteConflict(operation);
                    }
                    case "GET /favorites" -> {
                        describe(operation, "즐겨찾기", "내 즐겨찾기 목록 조회 (최신 등록순)");
                        success(operation, "200", "내 즐겨찾기 목록을 조회했습니다.", List.of(favorite()));
                        responseMedia(operation, "200").addExamples("빈 목록",
                                new Example().value(envelope(true, "COMMON200", "내 즐겨찾기 목록을 조회했습니다.", List.of())));
                    }
                    case "GET /favorites/{movieId}" -> {
                        describe(operation, "즐겨찾기", "영화의 즐겨찾기 여부 조회");
                        movieIdExample(operation);
                        success(operation, "200", "즐겨찾기 여부를 조회했습니다.", Map.of("isFavorite", true));
                        responseMedia(operation, "200").addExamples("미등록 영화 (정상 상태)",
                                new Example().value(envelope(true, "COMMON200", "즐겨찾기 여부를 조회했습니다.", Map.of("isFavorite", false))));
                    }
                    case "DELETE /favorites/{movieId}" -> {
                        describe(operation, "즐겨찾기", "즐겨찾기 해제");
                        movieIdExample(operation);
                        success(operation, "200", "즐겨찾기를 해제했습니다.", null);
                        failure(operation, "404", "FAVORITE404_1: 등록하지 않은 즐겨찾기", "FAVORITE404_1", "즐겨찾기한 영화를 찾을 수 없습니다.");
                    }
                    case "POST /movie-records" -> {
                        describe(operation, "영화 기록", "평점과 즐겨찾기 함께 저장");
                        operation.setDescription(operation.getDescription()
                                + "addToFavorites가 true이면 평점과 즐겨찾기를 같은 트랜잭션에서 저장합니다. "
                                + "false이면 평점만 저장하고 result.favorite는 null입니다.");
                        requestExample(operation, Map.of("movieId", 550, "score", 5,
                                "comment", "다시 보고 싶은 영화입니다.", "addToFavorites", true));
                        Map<String, Object> record = new LinkedHashMap<>();
                        record.put("rating", Map.of("ratingId", 1, "movieId", 550, "score", 5,
                                "comment", "다시 보고 싶은 영화입니다.",
                                "createdAt", "2026-11-16T15:00:00", "updatedAt", "2026-11-16T15:00:00"));
                        record.put("favorite", favorite());
                        success(operation, "201", "영화 기록을 저장했습니다.", record);
                        record = new LinkedHashMap<>(record);
                        record.put("favorite", null);
                        responseMedia(operation, "201").addExamples("즐겨찾기 추가 안 함",
                                new Example().value(envelope(true, "COMMON201", "영화 기록을 저장했습니다.", record)));
                        validation(operation, "별점은 5점 이하여야 합니다.");
                        failure(operation, "404", "MEMBER404_1: 회원 없음", "MEMBER404_1", "해당 회원을 찾을 수 없습니다.");
                        favoriteConflict(operation);
                        errorExample(operation, "409", "RATING409_1", "이미 이 영화에 평점을 남기셨습니다.");
                        operation.getResponses().get("409").setDescription("RATING409_1: 중복 평점 / FAVORITE409_1: 중복 즐겨찾기 / COMMON4091: DB 중복 제약 위반");
                    }
                    default -> { }
                }
            }));
        };
    }

    private void describe(Operation operation, String tag, String summary) {
        operation.setTags(List.of(tag));
        operation.setSummary(summary);
        operation.setDescription(operation.getDescription() + "\n\n" + summary + ".");
    }

    private void memberNotFound(Operation operation) {
        failure(operation, "404", "MEMBER404_1: 회원 없음", "MEMBER404_1", "해당 회원을 찾을 수 없습니다.");
    }

    private Map<String, Object> rating() {
        return Map.of("ratingId", 1, "movieId", 550, "score", 5, "comment", "다시 보고 싶은 영화입니다.",
                "createdAt", "2026-11-16T15:00:00", "updatedAt", "2026-11-16T15:00:00");
    }

    private void movieIdExample(Operation operation) {
        if (operation.getParameters() != null) {
            operation.getParameters().stream().filter(p -> "movieId".equals(p.getName()))
                    .forEach(p -> p.setExample(550));
        }
    }

    private void requestExample(Operation operation, Object example) {
        operation.getRequestBody().getContent().get(JSON).setExample(example);
    }

    private void validation(Operation operation, String message) {
        failure(operation, "400", "COMMON4001: 필수값 누락 또는 입력값 검증 실패", "COMMON4001", message);
    }

    private void favoriteConflict(Operation operation) {
        failure(operation, "409", "FAVORITE409_1: 중복 즐겨찾기 / COMMON4091: DB 중복 제약 위반",
                "FAVORITE409_1", "이미 이 영화를 즐겨찾기하셨습니다.");
        errorExample(operation, "409", "COMMON4091", "이미 존재하는 데이터입니다.");
    }

    private void success(Operation operation, String status, String message, Object result) {
        ApiResponse response = operation.getResponses().get(status);
        // ResponseEntity.status(201)은 자동 추론되지 않으므로 생성 응답의 스키마를 옮깁니다.
        if ("201".equals(status)) {
            ApiResponse inferred = operation.getResponses().remove("200");
            if (response == null) {
                response = inferred;
            }
        }
        if (response == null) {
            response = new ApiResponse();
        }
        operation.getResponses().addApiResponse(status, response);
        response.setDescription(message);
        responseMedia(operation, status).addExamples("성공",
                new Example().value(envelope(true, "COMMON" + status, message, result)));
    }

    private void failure(Operation operation, String status, String description, String code, String message) {
        Schema<?> schema = new Schema<>().type("object")
                .addProperty("isSuccess", new Schema<>().type("boolean"))
                .addProperty("code", new Schema<>().type("string"))
                .addProperty("message", new Schema<>().type("string"))
                .addProperty("result", new Schema<>().nullable(true));
        operation.getResponses().addApiResponse(status, new ApiResponse().description(description)
                .content(new Content().addMediaType(JSON, new MediaType().schema(schema))));
        errorExample(operation, status, code, message);
    }

    private void errorExample(Operation operation, String status, String code, String message) {
        responseMedia(operation, status).addExamples(code,
                new Example().value(envelope(false, code, message, null)));
    }

    private MediaType responseMedia(Operation operation, String status) {
        ApiResponse response = operation.getResponses().get(status);
        if (response.getContent() == null) {
            response.setContent(new Content());
        }
        return response.getContent().computeIfAbsent(JSON, key -> new MediaType());
    }

    private Map<String, Object> favorite() {
        return Map.of("favoriteId", 1, "movieId", 550, "createdAt", "2026-11-16T15:00:00");
    }

    private Map<String, Object> envelope(boolean success, String code, String message, Object result) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("isSuccess", success);
        body.put("code", code);
        body.put("message", message);
        body.put("result", result);
        return body;
    }
}
