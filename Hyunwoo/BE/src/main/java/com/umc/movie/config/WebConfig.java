// src/main/java/com/umc/movie/config/WebConfig.java (5주차에 만든 파일에 이어서 작성합니다)
package com.umc.movie.config;

import com.umc.movie.interceptor.AuthInterceptor;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import com.umc.movie.auth.LoginMemberArgumentResolver;
import org.springframework.web.method.support.HandlerMethodArgumentResolver;

import java.util.List;

@Configuration
@RequiredArgsConstructor
public class WebConfig implements WebMvcConfigurer {

    // 실제 인증 예외와 OpenAPI의 공개 API 표시에 같은 목록을 사용합니다.
    public static final List<String> PUBLIC_PATHS = List.of(
            "/auth/**", "/members", "/members/nickname/**", "/members/email/**",
            "/members/*/ratings", "/error",
            "/swagger-ui.html", "/swagger-ui/**", "/v3/api-docs", "/v3/api-docs/**",
            "/v3/api-docs.yaml"
    );

    private final AuthInterceptor authInterceptor;
    private final LoginMemberArgumentResolver loginMemberArgumentResolver;

    // 5주차에서 작성한 CORS 설정입니다. 본인이 설정한 값을 그대로 두세요.
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins("http://localhost:5173")
                .allowedMethods("GET", "POST", "PATCH", "DELETE", "OPTIONS")
                .allowedHeaders("*");
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(authInterceptor)
                // 일단 모든 경로를 잠그고
                .addPathPatterns("/**")
                // 로그인 없이도 써야 하는 경로만 예외로 열어줍니다
                .excludePathPatterns(PUBLIC_PATHS);
    }

    @Override
    public void addArgumentResolvers(List<HandlerMethodArgumentResolver> resolvers) {
        resolvers.add(loginMemberArgumentResolver);
    }
}
