package com.umc.movie.controller;

import com.umc.movie.entity.Favorite;
import com.umc.movie.entity.Member;
import com.umc.movie.repository.FavoriteRepository;
import com.umc.movie.repository.MemberRepository;
import com.umc.movie.repository.RatingRepository;
import com.umc.movie.util.JwtUtil;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.web.servlet.MockMvc;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

// 다른 테스트와 DB를 분리하고 종료 시 스키마를 정리합니다.
@SpringBootTest(properties = {
        "spring.datasource.url=jdbc:h2:mem:movie_record_rollback;MODE=MySQL;DB_CLOSE_DELAY=-1;DATABASE_TO_LOWER=TRUE"
})
@AutoConfigureMockMvc
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_CLASS)
class MovieRecordApiTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private MemberRepository memberRepository;
    @Autowired private FavoriteRepository favoriteRepository;
    @Autowired private RatingRepository ratingRepository;
    @Autowired private JwtUtil jwtUtil;

    // 테스트 자체에는 @Transactional을 붙이지 않아 서비스의 롤백을 검증합니다.
    @Test
    @DisplayName("즐겨찾기 중복으로 영화 기록 저장이 409/FAVORITE409_1로 실패하면 먼저 저장한 평점도 롤백된다")
    void duplicateFavoriteRollsBackPreviouslySavedRating() throws Exception {
        Member member = memberRepository.save(Member.builder()
                .email("rollback@umc.com").password("test-password").nickname("롤백테스트").build());
        favoriteRepository.save(Favorite.builder().member(member).movieId(550L).build());
        String token = jwtUtil.createAccessToken(member.getMemberId(), member.getEmail());
        long ratingCountBefore = ratingRepository.count();
        long favoriteCountBefore = favoriteRepository.count();

        mockMvc.perform(post("/movie-records")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "movieId": 550,
                                  "score": 5,
                                  "comment": "롤백 확인",
                                  "addToFavorites": true
                                }
                                """))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.isSuccess").value(false))
                .andExpect(jsonPath("$.code").value("FAVORITE409_1"));

        assertThat(ratingRepository.count())
                .as("영화 기록 저장 실패 시 평점 개수는 요청 전과 같아야 한다")
                .isEqualTo(ratingCountBefore);
        assertThat(ratingRepository.existsByMember_MemberIdAndMovieId(member.getMemberId(), 550L))
                .as("실패한 요청의 평점이 DB에 남아 있으면 안 된다")
                .isFalse();
        assertThat(favoriteRepository.count())
                .as("기존 즐겨찾기는 그대로 유지되어야 한다")
                .isEqualTo(favoriteCountBefore);
    }
}
