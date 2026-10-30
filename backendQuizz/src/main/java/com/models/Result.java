package com.models;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "result")
public class Result {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "score", nullable = false)
    private int score;

    @Column(name = "total_questions", nullable = false)
    private int totalQuestions;

    @Column(name = "elo_before", nullable = false)
    private int eloBefore;

    @Column(name = "elo_change", nullable = false)
    private int eloChange;

    @Column(name = "elo_after", nullable = false)
    private int eloAfter;

    @CreationTimestamp
    @Column(name = "completed_at", nullable = false, updatable = false)
    private LocalDateTime completedAt;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "quiz_id", nullable = false)
    private Long quizId;

    protected Result() {
    }

    public Long getId() {
        return id;
    }

    public int getScore() {
        return score;
    }

    public void setScore(int score) {
        this.score = score;
    }

    public int getTotalQuestions() {
        return totalQuestions;
    }

    public void setTotalQuestions(int totalQuestions) {
        this.totalQuestions = totalQuestions;
    }

    public int getEloBefore() {
        return eloBefore;
    }

    public void setEloBefore(int eloBefore) {
        this.eloBefore = eloBefore;
    }

    public int getEloChange() {
        return eloChange;
    }

    public void setEloChange(int eloChange) {
        this.eloChange = eloChange;
    }

    public int getEloAfter() {
        return eloAfter;
    }

    public void setEloAfter(int eloAfter) {
        this.eloAfter = eloAfter;
    }

    public LocalDateTime getCompletedAt() {
        return completedAt;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public Long getQuizId() {
        return quizId;
    }

    public void setQuizId(Long quizId) {
        this.quizId = quizId;
    }
}
