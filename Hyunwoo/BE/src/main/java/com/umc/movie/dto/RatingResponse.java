package com.umc.movie.dto;

import com.umc.movie.entity.Rating;
import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDateTime;

public record RatingResponse(
        @Schema(description = "평점 ID", example = "1")
        Long ratingId,
        @Schema(description = "영화 ID", example = "550")
        Long movieId,
        @Schema(description = "별점 (1~5점)", example = "5")
        Integer score,
        @Schema(description = "후기", example = "다시 보고 싶은 영화입니다.")
        String comment,
        @Schema(description = "평점 등록 시각", example = "2026-11-16T15:00:00")
        LocalDateTime createdAt,
        @Schema(description = "평점 마지막 수정 시각", example = "2026-11-16T15:00:00")
        LocalDateTime updatedAt
) {
    public static RatingResponse from(Rating rating) {
        return new RatingResponse(
                rating.getRatingId(),
                rating.getMovieId(),
                rating.getScore(),
                rating.getComment(),
                rating.getCreatedAt(),
                rating.getUpdatedAt()
        );
    }
}
