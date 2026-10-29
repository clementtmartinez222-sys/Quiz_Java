package com.example.backendquizz.api;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.sql.Timestamp;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/profile")
public class ProfileController {
    private static final RowMapper<RecentResult> RESULT_MAPPER = (resultSet, rowNumber) -> {
        Timestamp timestamp = resultSet.getTimestamp("completed_at");
        return new RecentResult(
                resultSet.getString("title"),
                resultSet.getInt("score") + " / " + resultSet.getInt("total_questions"),
                timestamp.toInstant()
        );
    };

    private final JdbcTemplate jdbcTemplate;

    public ProfileController(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @GetMapping
    public ProfileResponse getProfile(HttpServletRequest request) {
        AuthenticatedUser user = (AuthenticatedUser) request.getAttribute(BearerTokenFilter.USER_ATTRIBUTE);
        UserProfile profile = jdbcTemplate.queryForObject(
                "SELECT username, created_at FROM app_user WHERE id = ?",
                (resultSet, rowNumber) -> new UserProfile(
                        resultSet.getString("username"),
                        resultSet.getTimestamp("created_at").toLocalDateTime().toLocalDate()
                ),
                user.id()
        );

        Statistics statistics = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) AS quizzes_played, COALESCE(SUM(score), 0) AS correct_answers, "
                        + "COALESCE(SUM(total_questions), 0) AS total_answers, "
                        + "COALESCE(MAX(max_streak), 0) AS best_streak "
                        + "FROM quiz_result WHERE user_id = ?",
                (resultSet, rowNumber) -> new Statistics(
                        resultSet.getInt("quizzes_played"),
                        resultSet.getInt("correct_answers"),
                        resultSet.getInt("total_answers"),
                        resultSet.getInt("best_streak")
                ),
                user.id()
        );
        List<RecentResult> recentResults = jdbcTemplate.query(
                "SELECT quiz.title, quiz_result.score, quiz_result.total_questions, quiz_result.completed_at "
                        + "FROM quiz_result JOIN quiz ON quiz.id = quiz_result.quiz_id "
                        + "WHERE quiz_result.user_id = ? ORDER BY quiz_result.completed_at DESC, quiz_result.id DESC LIMIT 5",
                RESULT_MAPPER,
                user.id()
        );
        double averageScore = statistics.totalAnswers() == 0
                ? 0
                : Math.round((double) statistics.correctAnswers() / statistics.totalAnswers() * 1000) / 10.0;
        return new ProfileResponse(
                profile.username(),
                profile.memberSince(),
                new ProfileStatistics(
                        statistics.quizzesPlayed(),
                        averageScore,
                        statistics.correctAnswers(),
                        statistics.bestStreak(),
                        recentResults
                )
        );
    }

    public record ProfileResponse(String username, LocalDate memberSince, ProfileStatistics statistics) {
    }

    public record ProfileStatistics(
            int quizzesPlayed,
            double averageScore,
            int correctAnswers,
            int bestStreak,
            List<RecentResult> recentResults
    ) {
    }

    public record RecentResult(String theme, String score, Instant playedAt) {
    }

    private record UserProfile(String username, LocalDate memberSince) {
    }

    private record Statistics(int quizzesPlayed, int correctAnswers, int totalAnswers, int bestStreak) {
    }
}
