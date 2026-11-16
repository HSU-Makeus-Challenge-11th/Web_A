// src/main/java/com/umc/movie/controller/docs/MovieRecordControllerDocs.java
package com.umc.movie.controller.docs;

import com.umc.movie.dto.CreateMovieRecordRequest;
import com.umc.movie.dto.MovieRecordResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;

@Tag(name = "MovieRecord", description = "영화 기록 API (🔒 로그인 필요) - 평점과 즐겨찾기를 하나의 트랜잭션으로 저장")
public interface MovieRecordControllerDocs {

    @Operation(
            summary = "영화 기록 저장 (평점 + 즐겨찾기)",
            description = """
                    평점을 저장하고, addToFavorites가 true이면 즐겨찾기도 함께 저장합니다.
                    두 저장은 하나의 트랜잭션으로 묶여 있어 하나라도 실패하면 모두 rollback됩니다.
                    addToFavorites가 false이면 result.favorite은 null입니다.
                    """)
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "저장 성공",
                    content = @Content(mediaType = "application/json", examples = @ExampleObject("""
                            {"isSuccess": true, "code": "COMMON201", "message": "영화 기록을 저장했습니다.",
                             "result": {
                               "rating": {"ratingId": 5, "movieId": 238, "score": 5, "comment": "다시 보고 싶은 영화입니다.",
                                          "createdAt": "2026-11-16T13:25:29", "updatedAt": "2026-11-16T13:25:29"},
                               "favorite": {"favoriteId": 2, "movieId": 238, "createdAt": "2026-11-16T13:25:29"}
                             }}
                            """))),
            @ApiResponse(responseCode = "400", description = "입력값 검증 실패 (movieId, score 1~5, addToFavorites 필수)",
                    content = @Content(mediaType = "application/json", examples = @ExampleObject("""
                            {"isSuccess": false, "code": "COMMON4001", "message": "별점은 5점 이하여야 합니다.", "result": null}
                            """))),
            @ApiResponse(responseCode = "401", description = "토큰 없음 (AUTH401_2) / 유효하지 않음 (AUTH401_3) / 만료 (AUTH401_4)",
                    content = @Content(mediaType = "application/json", examples = @ExampleObject("""
                            {"isSuccess": false, "code": "AUTH401_2", "message": "로그인이 필요한 요청입니다.", "result": null}
                            """))),
            @ApiResponse(responseCode = "409", description = "이미 평점을 남긴 영화 (RATING409_1) / 이미 즐겨찾기한 영화 (FAVORITE409_1)",
                    content = @Content(mediaType = "application/json", examples = {
                            @ExampleObject(name = "RATING409_1", value = """
                                    {"isSuccess": false, "code": "RATING409_1", "message": "이미 이 영화에 평점을 남기셨습니다.", "result": null}
                                    """),
                            @ExampleObject(name = "FAVORITE409_1", value = """
                                    {"isSuccess": false, "code": "FAVORITE409_1", "message": "이미 이 영화를 즐겨찾기하셨습니다.", "result": null}
                                    """)
                    }))
    })
    ResponseEntity<com.umc.movie.dto.ApiResponse<MovieRecordResponse>> create(Long memberId, CreateMovieRecordRequest request);
}
