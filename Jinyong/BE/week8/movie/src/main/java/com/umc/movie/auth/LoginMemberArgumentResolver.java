// src/main/java/com/umc/movie/auth/LoginMemberArgumentResolver.java
package com.umc.movie.auth;

import com.umc.movie.exception.ApiException;
import com.umc.movie.interceptor.AuthInterceptor;
import org.springframework.core.MethodParameter;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.support.WebDataBinderFactory;
import org.springframework.web.context.request.NativeWebRequest;
import org.springframework.web.context.request.RequestAttributes;
import org.springframework.web.method.support.HandlerMethodArgumentResolver;
import org.springframework.web.method.support.ModelAndViewContainer;

@Component
public class LoginMemberArgumentResolver implements HandlerMethodArgumentResolver {

    /**
     * @LoginMember가 붙은 Long 파라미터만 이 리졸버가 맡습니다.
     */
    @Override
    public boolean supportsParameter(MethodParameter parameter) {
        return parameter.hasParameterAnnotation(LoginMember.class)
                && Long.class.equals(parameter.getParameterType());
    }

    /**
     * 인터셉터가 요청에 담아둔 memberId를 꺼내 파라미터에 넣어줍니다.
     * "memberId"라는 문자열은 이제 인터셉터와 이 클래스만 압니다.
     */
    @Override
    public Object resolveArgument(
            MethodParameter parameter,
            ModelAndViewContainer mavContainer,
            NativeWebRequest webRequest,
            WebDataBinderFactory binderFactory
    ) {
        Object memberId = webRequest.getAttribute(AuthInterceptor.MEMBER_ID, RequestAttributes.SCOPE_REQUEST);

        // 인터셉터 예외 목록에 들어간 경로에서 @LoginMember를 쓰면 값이 없습니다.
        // 조용히 null을 넘기지 않고 "로그인 필요"로 막습니다.
        if (memberId == null) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "AUTH401_2", "로그인이 필요한 요청입니다.");
        }

        return memberId;
    }
}
