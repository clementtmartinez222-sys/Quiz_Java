package com.Controller;

import com.Service.QuizService;
import com.dto.QuizResponse;
import com.dto.QuizUpdateRequest;
import com.entity.Quiz;
import jakarta.validation.Valid;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/quizzes")
public class QuizController {

    private final QuizService quizService;

    public QuizController(QuizService quizService) {
        this.quizService = quizService;
    }

    @GetMapping("/{id}")
    public QuizResponse getQuiz(@PathVariable Long id) {
        return quizService.getById(id);
    }

    @PutMapping("/{id}")
    public QuizResponse updateQuiz(@PathVariable Long id, @Valid @RequestBody QuizUpdateRequest request) {
        return quizService.update(id, request);
    }

}
