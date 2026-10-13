package com.dto;

import java.time.LocalDateTime;

public record QuizResponse(
        Long id,
        String title,
        String description,
        String category,
        String difficulty,
        String type,
        LocalDateTime createdAt
) {}
