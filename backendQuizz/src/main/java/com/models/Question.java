package com.models;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "question")
public class Question {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "statement", nullable = false, length = 500)
    private String statement;

    @Column(name = "img_path", length = 255)
    private String imgPath;

    @Column(name = "quiz_id", nullable = false)
    private Long quizId;

    protected Question() {
    }

    public Question(String statement, String imgPath, Long quizId) {
        this.statement = statement;
        this.imgPath = imgPath;
        this.quizId = quizId;
    }

    public Long getId() {
        return id;
    }

    public String getStatement() {
        return statement;
    }

    public void setStatement(String statement) {
        this.statement = statement;
    }

    public String getImgPath() {
        return imgPath;
    }

    public void setImgPath(String imgPath) {
        this.imgPath = imgPath;
    }

    public Long getQuizId() {
        return quizId;
    }

    public void setQuizId(Long quizId) {
        this.quizId = quizId;
    }
}
