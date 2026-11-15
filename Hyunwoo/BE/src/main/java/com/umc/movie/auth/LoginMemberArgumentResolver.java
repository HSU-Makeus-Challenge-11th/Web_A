package com.umc.movie.auth;

import com.umc.movie.interceptor.AuthInterceptor;
import org.springframework.core.MethodParameter;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.support.WebDataBinderFactory;
import org.springframework.web.context.request.NativeWebRequest;
import org.springframework.web.context.request.RequestAttributes;
import org.springframework.web.method.support.HandlerMethodArgumentResolver;
import org.springframework.web.method.support.ModelAndViewContainer;

@Component
public class LoginMemberArgumentResolver implements HandlerMethodArgumentResolver {

    @Override
    public boolean supportsParameter(MethodParameter parameter) {
        return parameter.hasParameterAnnotation(LoginMember.class)
                && Long.class.equals(parameter.getParameterType());
    }

    @Override
    public Object resolveArgument(
            MethodParameter parameter,
            ModelAndViewContainer mavContainer,
            NativeWebRequest webRequest,
            WebDataBinderFactory binderFactory
    ) {
        Object memberId = webRequest.getAttribute(
                AuthInterceptor.MEMBER_ID, RequestAttributes.SCOPE_REQUEST
        );

        if (memberId instanceof Long loginMemberId) {
            return loginMemberId;
        }

        throw new IllegalStateException("요청에 인증된 회원 ID가 없습니다.");
    }
}