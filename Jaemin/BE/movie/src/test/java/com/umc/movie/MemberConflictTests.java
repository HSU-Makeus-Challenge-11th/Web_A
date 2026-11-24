package com.umc.movie;

import com.umc.movie.repository.MemberRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoSpyBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import java.nio.charset.StandardCharsets;
import java.nio.file.*;
import static org.mockito.Mockito.*;
import static org.assertj.core.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.springframework.http.MediaType.APPLICATION_JSON;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class MemberConflictTests {
    @Autowired MockMvc mvc;
    @MockitoSpyBean MemberRepository members;

    @BeforeEach
    void clean() { members.deleteAll(); }

    @Test
    void precheckDistinguishesEmailAndNickname() throws Exception {
        signup("same@example.com", "original");
        conflict("precheck-email", "same@example.com", "another", "MEMBER4091", "이미 사용 중인 이메일입니다.", false);
        conflict("precheck-nickname", "other@example.com", "original", "MEMBER4092", "이미 사용 중인 닉네임입니다.", false);
    }

    @Test
    void realDatabaseEmailUniqueViolationAfterPrecheckPasses() throws Exception {
        signup("same@example.com", "original");
        // 동시 요청이 둘 다 중복 검사를 통과한 상태를 결정적으로 재현합니다.
        // 저장소/DB 저장은 실제 실행하고 사전 검사 결과만 false로 고정합니다.
        doReturn(false).when(members).existsByEmail("same@example.com");
        conflict("db-email", "same@example.com", "another", "MEMBER4091", "이미 사용 중인 이메일입니다.", true);
    }

    @Test
    void realDatabaseNicknameUniqueViolationAfterPrecheckPasses() throws Exception {
        signup("same@example.com", "original");
        doReturn(false).when(members).existsByNickname("original");
        conflict("db-nickname", "other@example.com", "original", "MEMBER4092", "이미 사용 중인 닉네임입니다.", true);
    }

    private void signup(String email, String nickname) throws Exception {
        mvc.perform(post("/members").contentType(APPLICATION_JSON).content(body(email, nickname)))
                .andExpect(status().isCreated());
    }

    private void conflict(String name, String email, String nickname, String code, String message, boolean database) throws Exception {
        MvcResult result = mvc.perform(post("/members").contentType(APPLICATION_JSON).content(body(email, nickname)))
                .andExpect(status().isConflict()).andExpect(jsonPath("$.code").value(code))
                .andExpect(jsonPath("$.message").value(message)).andExpect(jsonPath("$.isSuccess").value(false))
                .andExpect(jsonPath("$.result").isEmpty()).andReturn();
        assertThat(members.count()).isEqualTo(1);
        if (database) assertThat(result.getResolvedException()).isInstanceOf(org.springframework.dao.DataIntegrityViolationException.class);
        Path dir = Path.of("build", "challenge-evidence");
        Files.createDirectories(dir);
        Files.writeString(dir.resolve(name + ".txt"),
                "POST /members\nContent-Type: application/json\n" + body(email, nickname)
                + "\n\nHTTP " + result.getResponse().getStatus() + "\n"
                + result.getResponse().getContentAsString(StandardCharsets.UTF_8)
                + "\n\nResolved exception: " + result.getResolvedException().getClass().getSimpleName()
                + "\nDatabase rows: " + members.count()
                + (database ? "\nPrecheck: forced false; real repeated INSERT rejected by DB UNIQUE" : "\nPrecheck: real repository query"), StandardCharsets.UTF_8);
    }

    private String body(String email, String nickname) {
        return "{\"email\":\"" + email + "\",\"password\":\"Umc!1234\",\"nickname\":\"" + nickname + "\"}";
    }
}
