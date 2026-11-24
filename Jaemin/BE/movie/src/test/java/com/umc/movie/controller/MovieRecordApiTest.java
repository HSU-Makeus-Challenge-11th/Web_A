package com.umc.movie.controller;

import com.umc.movie.entity.Favorite;
import com.umc.movie.entity.Member;
import com.umc.movie.repository.FavoriteRepository;
import com.umc.movie.repository.MemberRepository;
import com.umc.movie.repository.RatingRepository;
import com.umc.movie.util.JwtUtil;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.bean.override.mockito.MockitoSpyBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.doReturn;
import static org.springframework.http.HttpHeaders.AUTHORIZATION;
import static org.springframework.http.MediaType.APPLICATION_JSON;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class MovieRecordApiTest {

    private static final long MOVIE_ID = 550L;

    @Autowired MockMvc mvc;
    @Autowired MemberRepository members;
    @Autowired RatingRepository ratings;
    @Autowired JwtUtil jwtUtil;
    @MockitoSpyBean FavoriteRepository favorites;

    private Member member;
    private Favorite existingFavorite;

    @BeforeEach
    void setUp() {
        member = members.save(Member.builder()
                .email("movie-record-test@example.com")
                .nickname("기록테스트")
                .password("unused")
                .build());
        existingFavorite = favorites.save(Favorite.builder().member(member).movieId(MOVIE_ID).build());
    }

    @AfterEach
    void cleanUp() {
        if (member == null) {
            return;
        }
        Long memberId = member.getMemberId();
        ratings.deleteAll(ratings.findByMember_MemberIdOrderByRatingIdDesc(memberId));
        favorites.deleteAll(favorites.findByMember_MemberIdOrderByFavoriteIdDesc(memberId));
        members.deleteById(memberId);
    }

    @Test
    void creatingMovieRecordForExistingFavoriteReturns409WithoutAddingRating() throws Exception {
        long ratingCountBefore = ratings.count();

        createMovieRecord()
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("FAVORITE409_1"));

        assertMovieRecordWasNotSaved(ratingCountBefore);
    }

    @Test
    void rollsBackRatingWhenFavoriteInsertViolatesUniqueConstraint() throws Exception {
        long ratingCountBefore = ratings.count();
        // 동시 요청으로 사전 검사를 통과한 상황을 재현하고, 실제 DB가 중복 INSERT를 거부하게 합니다.
        doReturn(false).when(favorites).existsByMember_MemberIdAndMovieId(member.getMemberId(), MOVIE_ID);

        createMovieRecord()
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("COMMON4091"));

        // 테스트 자체에 트랜잭션을 걸지 않아 요청이 끝난 뒤 DB 상태를 확인합니다.
        assertMovieRecordWasNotSaved(ratingCountBefore);
    }

    private ResultActions createMovieRecord() throws Exception {
        String token = jwtUtil.createAccessToken(member.getMemberId(), member.getEmail());
        return mvc.perform(post("/movie-records")
                .header(AUTHORIZATION, "Bearer " + token)
                .contentType(APPLICATION_JSON)
                .content("""
                        {"movieId": %d, "score": 5, "addToFavorites": true}
                        """.formatted(MOVIE_ID)));
    }

    private void assertMovieRecordWasNotSaved(long ratingCountBefore) {
        assertThat(ratings.count()).isEqualTo(ratingCountBefore);
        assertThat(ratings.existsByMember_MemberIdAndMovieId(member.getMemberId(), MOVIE_ID)).isFalse();
        assertThat(favorites.findByMember_MemberIdOrderByFavoriteIdDesc(member.getMemberId()))
                .extracting(Favorite::getFavoriteId)
                .containsExactly(existingFavorite.getFavoriteId());
    }
}
