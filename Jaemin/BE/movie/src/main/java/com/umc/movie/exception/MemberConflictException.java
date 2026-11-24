package com.umc.movie.exception;

public class MemberConflictException extends RuntimeException {
    private final String code;

    private MemberConflictException(String code, String message) {
        super(message);
        this.code = code;
    }

    public String getCode() {
        return code;
    }

    public static MemberConflictException email() {
        return new MemberConflictException("MEMBER4091", "이미 사용 중인 이메일입니다.");
    }

    public static MemberConflictException nickname() {
        return new MemberConflictException("MEMBER4092", "이미 사용 중인 닉네임입니다.");
    }
}
