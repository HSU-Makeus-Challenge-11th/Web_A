package com.umc.movie.controller;

import com.umc.movie.dto.ApiResponse;
import com.umc.movie.exception.ApiException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;
import com.umc.movie.exception.MemberDuplicateException;
import com.umc.movie.exception.MemberDuplicateException.Field;
import org.hibernate.exception.ConstraintViolationException;

@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Void>> handleValidation(MethodArgumentNotValidException exception) {
        String message = exception.getBindingResult().getFieldErrors().get(0).getDefaultMessage();
        return ResponseEntity.badRequest().body(ApiResponse.failure("COMMON4001", message));
    }

    @ExceptionHandler(MemberDuplicateException.class)
    public ResponseEntity<ApiResponse<Void>> handleMemberDuplicate(
            MemberDuplicateException exception
    ) {
        return memberDuplicateResponse(exception.field());
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ApiResponse<Void>> handleDataIntegrity(
            DataIntegrityViolationException exception
    ) {
        for (Throwable cause = exception.getCause(); cause != null; cause = cause.getCause()) {
            if (cause instanceof ConstraintViolationException violation) {
                String constraintName = violation.getConstraintName();
                if (constraintName == null) {
                    continue;
                }

                // MySQL이 member.uk_member_email처럼 테이블명을 붙여 줄 수 있다.
                String indexName = constraintName.substring(constraintName.lastIndexOf('.') + 1);

                if ("uk_member_email".equalsIgnoreCase(indexName)) {
                    return memberDuplicateResponse(Field.EMAIL);
                }
                if ("uk_member_nickname".equalsIgnoreCase(indexName)) {
                    return memberDuplicateResponse(Field.NICKNAME);
                }
            }
        }

        return ResponseEntity.status(409)
                .body(ApiResponse.failure("COMMON4091", "이미 존재하는 데이터입니다."));
    }

    private ResponseEntity<ApiResponse<Void>> memberDuplicateResponse(Field field) {
        return ResponseEntity.status(409)
                .body(ApiResponse.failure(field.code(), field.message()));
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiResponse<Void>> handleIllegalArgument(IllegalArgumentException exception) {
        return ResponseEntity.status(409).body(ApiResponse.failure("COMMON4092", exception.getMessage()));
    }

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<ApiResponse<Void>> handleResponseStatus(ResponseStatusException exception) {
        int status = exception.getStatusCode().value();
        return ResponseEntity.status(status)
                .body(ApiResponse.failure("COMMON" + status, exception.getReason()));
    }

    @ExceptionHandler(ApiException.class)
    public ResponseEntity<ApiResponse<Void>> handleApiException(ApiException exception) {
        return ResponseEntity.status(exception.getStatus())
                .body(ApiResponse.failure(exception.getCode(), exception.getMessage()));
    }
}