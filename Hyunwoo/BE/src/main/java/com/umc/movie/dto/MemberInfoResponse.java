// src/main/java/com/umc/movie/dto/MemberInfoResponse.java
package com.umc.movie.dto;

import com.umc.movie.entity.Member;
import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDateTime;

public record MemberInfoResponse(
        @Schema(description = "회원 이메일", example = "challenger@umc.com")
        String email,
        @Schema(description = "회원 닉네임", example = "영화조아")
        String nickname,
        @Schema(description = "회원 가입 시각", example = "2026-11-16T15:00:00")
        LocalDateTime createdAt
) {
    // 엔티티를 그대로 응답하면 password까지 나가버리므로 반드시 DTO로 옮겨 담습니다
    public static MemberInfoResponse from(Member member) {
        return new MemberInfoResponse(
                member.getEmail(),
                member.getNickname(),
                member.getCreatedAt()
        );
    }
}
