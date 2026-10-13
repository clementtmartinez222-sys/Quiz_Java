package com.mapper;

import com.dto.QuizResponse;
import com.dto.QuizUpdateRequest;
import com.entity.Quiz;
import org.springframework.stereotype.Component;

@Component
public class QuizMapper {

    public QuizResponse toResponse(Quiz quiz) {
        return new QuizResponse(
                quiz.getId(),
                quiz.getTitle(),
                quiz.getDescription(),
                quiz.getCategory(),
                quiz.getDifficulty(),
                quiz.getType(),
                quiz.getCreatedAt()
        );
    }

    public void updateEntity(Quiz quiz, QuizUpdateRequest request){
        quiz.setTitle(request.title());
        quiz.setDescription(request.description());
        quiz.setCategory(request.category());
        quiz.setDifficulty(request.difficulty());
        quiz.setType(request.type());
    }
}
