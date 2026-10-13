package com.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record QuizUpdateRequest(
        @NotBlank(message = "Le message est obligatoire.")
        @Size(max = 100)
        String title,

        @Size(max = 500)
        String description,

        @Size(max = 100)
        String category,

        @Size(max = 100)
        String difficulty,

        @Size(max = 100)
        String type
) {}
