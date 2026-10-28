package com.services;

import com.dto.QuizResponse;
import com.repositories.QuizRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class QuizService {
    private final QuizRepository quizRepository;

    public QuizService(QuizRepository quizRepository) {
        this.quizRepository = quizRepository;
    }

    public List<QuizResponse> getAllQuizzes() {
        return quizRepository.findAll().stream()
                .map(quiz -> new QuizResponse(
                        quiz.getId().toString(),
                        quiz.getTitle(),
                        quiz.getCategory()
                ))
                .toList();
    }
}
