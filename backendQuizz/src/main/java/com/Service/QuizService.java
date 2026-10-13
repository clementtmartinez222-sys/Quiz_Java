package com.Service;

import com.Repository.QuizRepository;
import com.dto.QuizResponse;
import com.dto.QuizUpdateRequest;
import com.entity.Quiz;
import com.exception.ResourceNotFoundException;
import com.mapper.QuizMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class QuizService {

    private final QuizRepository quizRepository;
    private final QuizMapper quizMapper;

    public QuizService(QuizRepository quizRepository, QuizMapper quizMapper) {
        this.quizRepository = quizRepository;
        this.quizMapper = quizMapper;
    }

    @Transactional(readOnly = true)
    public QuizResponse getById(Long id) {
        return quizMapper.toResponse(findQuizOrThrow(id));
    }

    @Transactional
    public QuizResponse update(long id, QuizUpdateRequest request) {
        Quiz quiz = findQuizOrThrow(id);
        quizMapper.updateEntity(quiz,request);
        return quizMapper.toResponse(quiz);
    }


    private Quiz findQuizOrThrow(Long id) {
        return quizRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Quiz " + id + " introuvable"));
    }

}
