package com.umc.movie.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.umc.movie.dto.CreateRatingRequest;
import com.umc.movie.entity.Member;
import com.umc.movie.entity.Rating;
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
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class RatingApiTest {

    @Autowired MockMvc mockMvc;
    @Autowired ObjectMapper objectMapper;
    @Autowired MemberRepository memberRepository;
    @Autowired RatingRepository ratingRepository;
    @Autowired JwtUtil jwtUtil;

    @Test
    @DisplayName("토큰 없이 POST /ratings를 호출하면 401과 AUTH401_2를 응답하고 저장하지 않는다")
    void createRatingWithoutTokenReturns401WithAuth4012() throws Exception {
        long countBefore = ratingRepository.count();

        mockMvc.perform(post("/ratings")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new CreateRatingRequest(550L, 5, "좋아요"))))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.isSuccess").value(false))
                .andExpect(jsonPath("$.code").value("AUTH401_2"));

        assertThat(ratingRepository.count()).isEqualTo(countBefore);
    }

    @Test
    @DisplayName("유효한 토큰으로 POST /ratings를 호출하면 201과 COMMON201을 응답하고 토큰 회원의 평점을 저장한다")
    void createRatingWithTokenReturns201AndPersistsRatingForAuthenticatedMember() throws Exception {
        Member member = memberRepository.save(Member.builder()
                .email("rating-api@umc.com").password("encoded").nickname("평점테스트").build());
        String token = jwtUtil.createAccessToken(member.getMemberId(), member.getEmail());

        String response = mockMvc.perform(post("/ratings")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new CreateRatingRequest(550L, 5, "좋아요"))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.isSuccess").value(true))
                .andExpect(jsonPath("$.code").value("COMMON201"))
                .andExpect(jsonPath("$.result.movieId").value(550))
                .andExpect(jsonPath("$.result.score").value(5))
                .andReturn().getResponse().getContentAsString(StandardCharsets.UTF_8);

        JsonNode result = objectMapper.readTree(response).path("result");
        ratingRepository.flush();
        Rating saved = ratingRepository.findById(result.path("ratingId").asLong()).orElseThrow();
        assertThat(saved.getMember().getMemberId()).isEqualTo(member.getMemberId());
        assertThat(saved.getMovieId()).isEqualTo(550L);
        assertThat(saved.getScore()).isEqualTo(5);
        assertThat(saved.getComment()).isEqualTo("좋아요");
    }
}
