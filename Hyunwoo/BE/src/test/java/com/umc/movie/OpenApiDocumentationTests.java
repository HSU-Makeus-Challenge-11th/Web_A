package com.umc.movie;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.umc.movie.util.JwtUtil;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.nio.charset.StandardCharsets;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(properties = {
        "spring.datasource.url=jdbc:h2:mem:openapi;MODE=MySQL;DB_CLOSE_DELAY=-1",
        "spring.datasource.driver-class-name=org.h2.Driver",
        "spring.datasource.username=sa",
        "spring.datasource.password=",
        "spring.jpa.hibernate.ddl-auto=create-drop",
        "jwt.secret=swagger-test-only-signing-key-at-least-32-bytes",
        "jwt.access-expiration=3600"
})
@AutoConfigureMockMvc
class OpenApiDocumentationTests {

    @Autowired MockMvc mvc;
    @Autowired ObjectMapper mapper;
    @Autowired JwtUtil jwtUtil;

    @Test
    void documentsWeekEightExamplesAndSecurityWithoutMemberIdInput() throws Exception {
        String document = mvc.perform(get("/v3/api-docs"))
                .andExpect(status().isOk()).andReturn().getResponse().getContentAsString(StandardCharsets.UTF_8);
        JsonNode api = mapper.readTree(document);
        assertThat(api.at("/components/securitySchemes/bearerAuth/scheme").asText()).isEqualTo("bearer");

        String[][] endpoints = {
                {"/favorites", "post", "201"}, {"/favorites", "get", "200"},
                {"/favorites/{movieId}", "get", "200"}, {"/favorites/{movieId}", "delete", "200"},
                {"/movie-records", "post", "201"}
        };
        for (String[] endpoint : endpoints) {
            JsonNode operation = api.path("paths").path(endpoint[0]).path(endpoint[1]);
            assertThat(operation.path("summary").asText()).isNotBlank();
            assertThat(operation.at("/security/0").has("bearerAuth")).isTrue();
            assertThat(operation.path("responses").path(endpoint[2])
                    .at("/content/application~1json/examples/성공/value/isSuccess").asBoolean()).isTrue();
            assertThat(operation.at("/responses/401/content/application~1json/examples/AUTH401_2/value/code").asText())
                    .isEqualTo("AUTH401_2");
            for (JsonNode parameter : operation.path("parameters")) {
                assertThat(parameter.path("name").asText()).isNotEqualTo("memberId");
            }
        }
        JsonNode favorites = api.path("paths").path("/favorites").path("post");
        assertThat(favorites.at("/requestBody/content/application~1json/example/movieId").asInt()).isEqualTo(550);
        assertThat(favorites.at("/responses/409/content/application~1json/examples/FAVORITE409_1/value/code").asText())
                .isEqualTo("FAVORITE409_1");
        assertThat(api.path("paths").path("/favorites/{movieId}").path("delete")
                .at("/responses/404/content/application~1json/examples/FAVORITE404_1/value/code").asText())
                .isEqualTo("FAVORITE404_1");
        JsonNode record = api.path("paths").path("/movie-records").path("post")
                .at("/responses/201/content/application~1json/examples/성공/value/result");
        assertThat(record.hasNonNull("rating")).isTrue();
        assertThat(record.hasNonNull("favorite")).isTrue();
        assertThat(api.path("paths").path("/auth/login").path("post").path("security").isEmpty()).isTrue();
        assertThat(api.path("paths").path("/members").path("post").path("security").isEmpty()).isTrue();
    }

    @Test
    void swaggerUiAndConfigurationArePublic() throws Exception {
        mvc.perform(get("/swagger-ui.html")).andExpect(status().is3xxRedirection());
        mvc.perform(get("/swagger-ui/index.html")).andExpect(status().isOk());
        mvc.perform(get("/v3/api-docs/swagger-config")).andExpect(status().isOk());
        mvc.perform(get("/v3/api-docs.yaml")).andExpect(status().isOk());
    }

    @Test
    void documentationAccessDoesNotMakeBusinessApisPublic() throws Exception {
        mvc.perform(post("/favorites").contentType(MediaType.APPLICATION_JSON).content("{\"movieId\":550}"))
                .andExpect(status().isUnauthorized()).andExpect(jsonPath("$.code").value("AUTH401_2"));
        mvc.perform(post("/movie-records").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"movieId\":550,\"score\":5,\"addToFavorites\":true}"))
                .andExpect(status().isUnauthorized()).andExpect(jsonPath("$.code").value("AUTH401_2"));
        mvc.perform(post("/auth/login").contentType(MediaType.APPLICATION_JSON).content("{}"))
                .andExpect(status().isBadRequest()).andExpect(jsonPath("$.code").value("COMMON4001"));
    }

    @Test
    void bearerTokenStillIdentifiesMemberAndValidatesRequests() throws Exception {
        String token = jwtUtil.createAccessToken(1L, "swagger-test@example.com");
        mvc.perform(get("/favorites/550").header("Authorization", "Bearer " + token))
                .andExpect(status().isOk()).andExpect(jsonPath("$.result.isFavorite").value(false));
        mvc.perform(post("/favorites").header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON).content("{\"movieId\":0}"))
                .andExpect(status().isBadRequest()).andExpect(jsonPath("$.code").value("COMMON4001"));
    }
}
