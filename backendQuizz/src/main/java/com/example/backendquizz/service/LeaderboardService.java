package com.example.backendquizz.service;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class LeaderboardService {
    private final JdbcTemplate jdbcTemplate;

    public LeaderboardService(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public List<PlayerScore> listPlayers() {
        return jdbcTemplate.query(
                "SELECT u.id, u.username, COUNT(r.id) AS quizzes_played, "
                        + "COALESCE(ROUND(100.0 * SUM(r.score) / NULLIF(SUM(r.total_questions), 0), 1), 0) AS average_score, "
                        + "COALESCE(SUM(r.score), 0) AS correct_answers "
                        + "FROM app_user u LEFT JOIN quiz_result r ON r.user_id = u.id "
                        + "GROUP BY u.id, u.username ORDER BY average_score DESC, quizzes_played DESC, LOWER(u.username)",
                (rs, row) -> new PlayerScore(
                        rs.getLong("id"), rs.getString("username"), rs.getInt("quizzes_played"),
                        rs.getDouble("average_score"), rs.getInt("correct_answers")
                )
        );
    }

    public record PlayerScore(long id, String username, int quizzesPlayed, double averageScore, int correctAnswers) { }
}
