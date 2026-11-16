// src/main/java/com/umc/movie/controller/docs/FavoriteControllerDocs.java
package com.umc.movie.controller.docs;

import com.umc.movie.dto.CreateFavoriteRequest;
import com.umc.movie.dto.FavoriteResponse;
import com.umc.movie.dto.FavoriteStatusResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;

import java.util.List;

/**
 * Swagger 문서용 어노테이션을 모아 둔 인터페이스입니다.
 * 컨트롤러가 이 인터페이스를 구현하면, 컨트롤러 코드는 깔끔하게 유지하면서 문서가 붙습니다.
 */
@Tag(name = "Favorite", description = "즐겨찾기 API (🔒 로그인 필요)")
public interface FavoriteControllerDocs {

    String UNAUTHORIZED_EXAMPLE = """
            {"isSuccess": false, "code": "AUTH401_2", "message": "로그인이 필요한 요청입니다.", "result": null}
            """;

    @Operation(summary = "즐겨찾기 등록", description = "로그인한 회원이 TMDB 영화 ID로 즐겨찾기를 등록합니다. memberId는 토큰에서 꺼냅니다.")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "등록 성공",
                    content = @Content(mediaType = "application/json", examples = @ExampleObject("""
                            {"isSuccess": true, "code": "COMMON201", "message": "즐겨찾기를 등록했습니다.",
                             "result": {"favoriteId": 1, "movieId": 550, "createdAt": "2026-11-16T13:13:36"}}
                            """))),
            @ApiResponse(responseCode = "400", description = "movieId가 없거나 양수가 아님",
                    content = @Content(mediaType = "application/json", examples = @ExampleObject("""
                            {"isSuccess": false, "code": "COMMON4001", "message": "영화 ID는 양수여야 합니다.", "result": null}
                            """))),
            @ApiResponse(responseCode = "401", description = "토큰 없음 (AUTH401_2) / 유효하지 않음 (AUTH401_3) / 만료 (AUTH401_4)",
                    content = @Content(mediaType = "application/json", examples = @ExampleObject(UNAUTHORIZED_EXAMPLE))),
            @ApiResponse(responseCode = "409", description = "이미 즐겨찾기한 영화",
                    content = @Content(mediaType = "application/json", examples = @ExampleObject("""
                            {"isSuccess": false, "code": "FAVORITE409_1", "message": "이미 이 영화를 즐겨찾기하셨습니다.", "result": null}
                            """)))
    })
    ResponseEntity<com.umc.movie.dto.ApiResponse<FavoriteResponse>> create(Long memberId, CreateFavoriteRequest request);

    @Operation(summary = "내 즐겨찾기 목록 조회", description = "로그인한 회원의 즐겨찾기를 최신 등록 순으로 조회합니다. 없으면 빈 배열을 응답합니다.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "조회 성공 (비어 있어도 200)",
                    content = @Content(mediaType = "application/json", examples = @ExampleObject("""
                            {"isSuccess": true, "code": "COMMON200", "message": "내 즐겨찾기 목록을 조회했습니다.",
                             "result": [{"favoriteId": 1, "movieId": 550, "createdAt": "2026-11-16T13:13:36"}]}
                            """))),
            @ApiResponse(responseCode = "401", description = "인증 실패",
                    content = @Content(mediaType = "application/json", examples = @ExampleObject(UNAUTHORIZED_EXAMPLE)))
    })
    ResponseEntity<com.umc.movie.dto.ApiResponse<List<FavoriteResponse>>> getMyFavorites(Long memberId);

    @Operation(summary = "특정 영화 즐겨찾기 여부 조회", description = "즐겨찾기하지 않은 것도 정상 상태이므로 200과 isFavorite: false를 응답합니다.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "조회 성공",
                    content = @Content(mediaType = "application/json", examples = @ExampleObject("""
                            {"isSuccess": true, "code": "COMMON200", "message": "즐겨찾기 여부를 조회했습니다.",
                             "result": {"isFavorite": true}}
                            """))),
            @ApiResponse(responseCode = "401", description = "인증 실패",
                    content = @Content(mediaType = "application/json", examples = @ExampleObject(UNAUTHORIZED_EXAMPLE)))
    })
    ResponseEntity<com.umc.movie.dto.ApiResponse<FavoriteStatusResponse>> getStatus(
            Long memberId,
            @Parameter(description = "TMDB 영화 ID", example = "550") Long movieId);

    @Operation(summary = "즐겨찾기 해제", description = "로그인한 회원의 즐겨찾기를 해제합니다.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "해제 성공",
                    content = @Content(mediaType = "application/json", examples = @ExampleObject("""
                            {"isSuccess": true, "code": "COMMON200", "message": "즐겨찾기를 해제했습니다.", "result": null}
                            """))),
            @ApiResponse(responseCode = "401", description = "인증 실패",
                    content = @Content(mediaType = "application/json", examples = @ExampleObject(UNAUTHORIZED_EXAMPLE))),
            @ApiResponse(responseCode = "404", description = "즐겨찾기하지 않은 영화",
                    content = @Content(mediaType = "application/json", examples = @ExampleObject("""
                            {"isSuccess": false, "code": "FAVORITE404_1", "message": "즐겨찾기한 영화를 찾을 수 없습니다.", "result": null}
                            """)))
    })
    ResponseEntity<com.umc.movie.dto.ApiResponse<Void>> delete(
            Long memberId,
            @Parameter(description = "TMDB 영화 ID", example = "550") Long movieId);
}
