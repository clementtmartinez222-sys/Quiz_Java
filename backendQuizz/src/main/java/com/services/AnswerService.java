package com.services;

import com.models.Answer;
import com.repositories.AnswerRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class AnswerService {
    private final AnswerRepository answerRepository;

    public AnswerService(AnswerRepository answerRepository) {
        this.answerRepository = answerRepository;
    }

    public List<Answer> getAllAnswers() {
        return answerRepository.findAll();
    }

    public Optional<Answer> getAnswerById(Long id) {
        return answerRepository.findById(id);
    }

    public Answer createAnswer(Answer answer) {
        return answerRepository.save(answer);
    }
}
