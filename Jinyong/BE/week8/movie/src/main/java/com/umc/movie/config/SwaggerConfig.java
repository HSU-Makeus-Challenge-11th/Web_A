// src/main/java/com/umc/movie/config/SwaggerConfig.java
package com.umc.movie.config;

import com.umc.movie.auth.LoginMember;
import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springdoc.core.utils.SpringDocUtils;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.bind.annotation.RequestAttribute;

@Configuration
public class SwaggerConfig {

    public static final String JWT_SCHEME = "JWT";

    static {
        // 로그인한 회원 ID는 토큰에서 꺼내므로 클라이언트가 보내는 값이 아닙니다.
        // Swagger 화면에 memberId 입력칸이 생기지 않도록 숨깁니다.
        SpringDocUtils.getConfig().addAnnotationsToIgnore(LoginMember.class, RequestAttribute.class);
    }

    @Bean
    public OpenAPI openAPI() {
        // Authorization: Bearer {token} 헤더를 쓰는 인증 방식을 등록합니다.
        SecurityScheme bearerScheme = new SecurityScheme()
                .type(SecurityScheme.Type.HTTP)
                .scheme("bearer")
                .bearerFormat("JWT")
                .description("로그인 API(POST /auth/login) 응답의 accessToken을 입력하세요. 'Bearer '는 자동으로 붙습니다.");

        return new OpenAPI()
                .info(new Info()
                        .title("UMC Movie API")
                        .description("""
                                UMC 11기 영화 서비스 API 문서입니다.

                                - 🔒 자물쇠가 있는 API는 `Authorization: Bearer {token}` 헤더가 필요합니다.
                                - 오른쪽 위 **Authorize** 버튼에 토큰을 한 번 넣으면 모든 요청에 붙습니다.
                                - 모든 응답은 `isSuccess`, `code`, `message`, `result` 공통 형식을 따릅니다.
                                """)
                        .version("v1"))
                .components(new Components().addSecuritySchemes(JWT_SCHEME, bearerScheme))
                // 기본값은 "모든 API에 토큰 필요". 공개 API는 컨트롤러에서 @SecurityRequirements()로 풉니다.
                // AuthInterceptor의 "모든 경로 보호 + 예외 목록" 구조와 같은 방식입니다.
                .addSecurityItem(new SecurityRequirement().addList(JWT_SCHEME));
    }
}
