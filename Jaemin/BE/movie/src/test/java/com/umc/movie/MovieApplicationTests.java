package com.umc.movie;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.umc.movie.entity.Member;
import com.umc.movie.entity.Rating;
import com.umc.movie.repository.MemberRepository;
import com.umc.movie.repository.RatingRepository;
import com.umc.movie.util.JwtUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;

import static org.assertj.core.api.Assertions.*;
import static org.springframework.http.HttpHeaders.AUTHORIZATION;
import static org.springframework.http.MediaType.APPLICATION_JSON;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class MovieApplicationTests {
    @Autowired MockMvc mvc;
    @Autowired ObjectMapper mapper;
    @Autowired MemberRepository members;
    @Autowired RatingRepository ratings;
    @Autowired PasswordEncoder encoder;
    @Autowired JwtUtil jwtUtil;

    @BeforeEach
    void cleanDatabase() {
        ratings.deleteAll();
        members.deleteAll();
    }

    @Test
    void signUpHashesPasswordAndRejectsDuplicateEmailAndNickname() throws Exception {
        MvcResult result = mvc.perform(post("/members").contentType(APPLICATION_JSON)
                .content(signUpBody("first@example.com", "first")))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.isSuccess").value(true))
                .andExpect(jsonPath("$.code").value("COMMON201"))
                .andExpect(jsonPath("$.result.password").doesNotExist()).andReturn();
        capture("signup", "POST /members", signUpBody("first@example.com", "first"), result);
        Member saved = members.findAll().getFirst();
        assertThat(saved.getPassword()).hasSize(60).isNotEqualTo("Umc!1234");
        assertThat(encoder.matches("Umc!1234", saved.getPassword())).isTrue();
        mvc.perform(post("/members").contentType(APPLICATION_JSON)
                .content(signUpBody("first@example.com", "second")))
                .andExpect(status().isConflict()).andExpect(jsonPath("$.isSuccess").value(false));
        mvc.perform(post("/members").contentType(APPLICATION_JSON)
                .content(signUpBody("second@example.com", "first")))
                .andExpect(status().isConflict()).andExpect(jsonPath("$.result").isEmpty());
        assertThat(members.count()).isEqualTo(1);
    }

    @Test
    void invalidMemberFieldsReturnCommonFailure() throws Exception {
        for (String body : new String[]{signUpBody("invalid", "valid"), signUpBody("ok@example.com", "a"),
                "{\"email\":\"ok@example.com\",\"nickname\":\"valid\",\"password\":\"weak\"}"}) {
            MvcResult result = mvc.perform(post("/members").contentType(APPLICATION_JSON).content(body))
                    .andExpect(status().isBadRequest()).andExpect(jsonPath("$.isSuccess").value(false))
                    .andExpect(jsonPath("$.code").value("COMMON4001"))
                    .andExpect(jsonPath("$.message").isString()).andExpect(jsonPath("$.result").isEmpty()).andReturn();
            if (body.contains("invalid")) capture("validation", "POST /members", body, result);
        }
        assertThat(members.count()).isZero();
    }

    @Test
    void creatingRatingWithoutTokenReturns401() throws Exception {
        mvc.perform(post("/ratings").contentType(APPLICATION_JSON)
                        .content("{\"movieId\":550,\"score\":4}"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value("AUTH401_2"));
        assertThat(ratings.count()).isZero();
    }

    @Test
    void creatingRatingWithTokenReturns201AndStoresItForTokenOwner() throws Exception {
        long owner = signUp("owner@example.com", "owner");
        mvc.perform(post("/ratings").header(AUTHORIZATION, bearerToken(owner, "owner@example.com"))
                        .contentType(APPLICATION_JSON).content("{\"movieId\":550,\"score\":4}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.code").value("COMMON201"))
                .andExpect(jsonPath("$.result.movieId").value(550));
        assertThat(ratings.existsByMember_MemberIdAndMovieId(owner, 550L)).isTrue();
    }

    @Test
    void ratingLifecycleAndOwnership() throws Exception {
        long owner = signUp("owner@example.com", "owner");
        long other = signUp("other@example.com", "other");
        String ownerToken = bearerToken(owner, "owner@example.com");
        String otherToken = bearerToken(other, "other@example.com");
        String listUrl = "/members/" + owner + "/ratings";
        String body = "{\"movieId\":550,\"score\":4,\"comment\":\"좋아요\"}";
        MvcResult created = mvc.perform(post("/ratings").header(AUTHORIZATION, ownerToken)
                        .contentType(APPLICATION_JSON).content(body))
                .andExpect(status().isCreated()).andExpect(jsonPath("$.isSuccess").value(true)).andReturn();
        capture("rating-create", "POST /ratings", body, created);
        long id = mapper.readTree(created.getResponse().getContentAsString()).path("result").path("ratingId").asLong();
        String ratingUrl = "/ratings/" + id;
        mvc.perform(post("/ratings").header(AUTHORIZATION, ownerToken).contentType(APPLICATION_JSON).content(body))
                .andExpect(status().isConflict()).andExpect(jsonPath("$.code").value("RATING409_1"));
        assertThat(ratings.count()).isEqualTo(1);
        String update = "{\"score\":5,\"comment\":\"수정 후기\"}";
        for (String method : new String[]{"patch", "delete"}) {
            mvc.perform((method.equals("patch") ? patch(ratingUrl).contentType(APPLICATION_JSON).content(update) : delete(ratingUrl))
                            .header(AUTHORIZATION, otherToken))
                    .andExpect(status().isForbidden()).andExpect(jsonPath("$.code").value("RATING403_1"));
            String missing = "/ratings/999999";
            mvc.perform((method.equals("patch") ? patch(missing).contentType(APPLICATION_JSON).content(update) : delete(missing))
                            .header(AUTHORIZATION, ownerToken))
                    .andExpect(status().isNotFound()).andExpect(jsonPath("$.code").value("RATING404_1"));
        }
        mvc.perform(patch(ratingUrl).header(AUTHORIZATION, ownerToken).contentType(APPLICATION_JSON).content(update))
                .andExpect(status().isOk()).andExpect(jsonPath("$.code").value("COMMON200"));
        mvc.perform(get(listUrl)).andExpect(status().isOk()).andExpect(jsonPath("$[0].score").value(5))
                .andExpect(jsonPath("$[0].comment").value("수정 후기"));
        mvc.perform(delete(ratingUrl).header(AUTHORIZATION, ownerToken))
                .andExpect(status().isOk()).andExpect(jsonPath("$.code").value("COMMON200"))
                .andExpect(jsonPath("$.result").isEmpty());
        assertThat(ratings.count()).isZero();
        mvc.perform(get(listUrl)).andExpect(status().isOk()).andExpect(content().json("[]"));
    }

    @Test
    void ratingInputAndMissingMemberAreRejected() throws Exception {
        long owner = signUp("owner@example.com", "owner");
        String ownerToken = bearerToken(owner, "owner@example.com");
        for (String body : new String[]{"{\"movieId\":550,\"score\":0}", "{\"movieId\":550,\"score\":6}",
                "{\"movieId\":550}", "{\"movieId\":0,\"score\":4}",
                "{\"movieId\":550,\"score\":4.5}", "{\"movieId\":550,\"score\":4,\"comment\":\"" + "a".repeat(501) + "\"}", "{"}) {
            mvc.perform(post("/ratings").header(AUTHORIZATION, ownerToken).contentType(APPLICATION_JSON).content(body))
                    .andExpect(status().isBadRequest()).andExpect(jsonPath("$.code").value("COMMON4001"));
        }
        mvc.perform(post("/ratings").header(AUTHORIZATION, bearerToken(999999L, "missing@example.com"))
                .contentType(APPLICATION_JSON)
                .content("{\"movieId\":550,\"score\":4}"))
                .andExpect(status().isNotFound()).andExpect(jsonPath("$.code").value("MEMBER404_1"));
        assertThat(ratings.count()).isZero();
    }

    @Test
    void databaseUniqueConstraintBlocksBypassedPrecheck() throws Exception {
        long owner = signUp("owner@example.com", "owner");
        Member member = members.findById(owner).orElseThrow();
        ratings.saveAndFlush(Rating.builder().member(member).movieId(550L).score(4).build());
        assertThatThrownBy(() -> ratings.saveAndFlush(Rating.builder().member(member).movieId(550L).score(5).build()))
                .isInstanceOf(DataIntegrityViolationException.class);
        assertThat(ratings.count()).isEqualTo(1);
        assertThatThrownBy(() -> members.saveAndFlush(Member.builder().email(member.getEmail())
                .nickname("another").password(member.getPassword()).build()))
                .isInstanceOf(DataIntegrityViolationException.class);
    }

    private long signUp(String email, String nickname) throws Exception {
        String response = mvc.perform(post("/members").contentType(APPLICATION_JSON).content(signUpBody(email, nickname)))
                .andExpect(status().isCreated()).andReturn().getResponse().getContentAsString();
        return mapper.readTree(response).path("result").path("memberId").asLong();
    }

    private String bearerToken(long memberId, String email) {
        return "Bearer " + jwtUtil.createAccessToken(memberId, email);
    }

    private String signUpBody(String email, String nickname) {
        return "{\"email\":\"" + email + "\",\"password\":\"Umc!1234\",\"nickname\":\"" + nickname + "\"}";
    }

    private void capture(String name, String request, String body, MvcResult result) throws Exception {
        Path directory = Path.of("build", "mission-evidence");
        Files.createDirectories(directory);
        JsonNode response = mapper.readTree(result.getResponse().getContentAsString(StandardCharsets.UTF_8));
        Files.writeString(directory.resolve(name + ".txt"), request + "\nContent-Type: application/json\n\n" + body
                + "\n\nHTTP " + result.getResponse().getStatus() + "\n"
                + mapper.writerWithDefaultPrettyPrinter().writeValueAsString(response), StandardCharsets.UTF_8);
    }
}
