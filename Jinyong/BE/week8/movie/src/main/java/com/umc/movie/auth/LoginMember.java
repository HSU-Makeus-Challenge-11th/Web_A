// src/main/java/com/umc/movie/auth/LoginMember.java
package com.umc.movie.auth;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * 컨트롤러 파라미터에 붙이면 "로그인한 사용자의 memberId"가 들어옵니다.
 * 값은 AuthInterceptor가 토큰을 검증하고 요청에 담아둔 것을 LoginMemberArgumentResolver가 꺼내 줍니다.
 */
@Target(ElementType.PARAMETER)
@Retention(RetentionPolicy.RUNTIME)
public @interface LoginMember {
}
