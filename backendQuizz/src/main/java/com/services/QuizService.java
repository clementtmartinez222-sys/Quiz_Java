package com.services;

import com.dto.QuizResponse;
import com.models.Quiz;
import com.repositories.QuizRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class QuizService {
    private final QuizRepository quizRepository;

    public QuizService(QuizRepository quizRepository) {
        this.quizRepository = quizRepository;
    }

    public List<QuizResponse> getAllQuizzes() {
        return quizRepository.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    public Optional<QuizResponse> getQuizById(Long id) {
        return quizRepository.findById(id).map(this::toResponse);
    }

    public Quiz createQuiz(Quiz quiz) {
        return quizRepository.save(quiz);
    }

    private QuizResponse toResponse(Quiz quiz) {
        return new QuizResponse(
                quiz.getId().toString(),
                quiz.getTitle(),
                quiz.getCategory()
        );
    }
}
