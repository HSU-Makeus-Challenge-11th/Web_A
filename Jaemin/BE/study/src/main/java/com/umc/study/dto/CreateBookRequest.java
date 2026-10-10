package com.umc.study.dto;

import jakarta.validation.constraints.*;

public record CreateBookRequest(
        @NotNull Long categoryId,
        @NotBlank @Size(max = 100) String title,
        String description
) {}