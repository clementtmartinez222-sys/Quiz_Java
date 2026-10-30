package com.example.backendquizz.api;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/quiz")
public class QuizController {
    private final JdbcTemplate jdbcTemplate;

    public QuizController(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @GetMapping("/themes")
    public List<ThemeResponse> getThemes() {
        return jdbcTemplate.query(
                "SELECT slug, title, category FROM quiz ORDER BY category, title",
                (resultSet, rowNumber) -> new ThemeResponse(
                        resultSet.getString("slug"),
                        resultSet.getString("title"),
                        resultSet.getString("category")
                )
        );
    }

    @GetMapping("/themes/{themeId}/questions")
    public List<QuestionResponse> getQuestions(@PathVariable String themeId) {
        List<QuestionRow> rows = jdbcTemplate.query(
                "SELECT question.id AS question_id, question.statement, answer.option_key, "
                        + "answer.answer_text, answer.is_correct "
                        + "FROM quiz JOIN question ON question.quiz_id = quiz.id "
                        + "JOIN answer ON answer.question_id = question.id "
                        + "WHERE quiz.slug = ? ORDER BY question.id, answer.id",
                (resultSet, rowNumber) -> new QuestionRow(
                        resultSet.getLong("question_id"),
                        resultSet.getString("statement"),
                        resultSet.getString("option_key"),
                        resultSet.getString("answer_text"),
                        resultSet.getBoolean("is_correct")
                ),
                themeId
        );

        Map<Long, QuestionBuilder> questions = new LinkedHashMap<>();
        for (QuestionRow row : rows) {
            QuestionBuilder question = questions.computeIfAbsent(
                    row.id(),
                    ignored -> new QuestionBuilder(row.id(), row.statement())
            );
            question.options().add(new OptionResponse(row.optionKey(), row.answerText()));
            if (row.correct()) question.setCorrectOptionId(row.optionKey());
        }
        return questions.values().stream().map(QuestionBuilder::toResponse).toList();
    }

    @PostMapping("/results")
    public ResponseEntity<Void> submitResult(
            @Valid @RequestBody ResultRequest result,
            HttpServletRequest request
    ) {
        QuizSummary quiz = jdbcTemplate.query(
                "SELECT quiz.id, COUNT(question.id) AS question_count FROM quiz "
                        + "LEFT JOIN question ON question.quiz_id = quiz.id "
                        + "WHERE quiz.slug = ? GROUP BY quiz.id",
                (resultSet, rowNumber) -> new QuizSummary(
                        resultSet.getLong("id"),
                        resultSet.getInt("question_count")
                ),
                result.themeId()
        ).stream().findFirst().orElseThrow(() ->
                new ResponseStatusException(HttpStatus.NOT_FOUND, "Quiz theme not found"));
        if (result.totalQuestions() != quiz.questionCount()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Total question count does not match the quiz");
        }
        AuthenticatedUser user = (AuthenticatedUser) request.getAttribute(BearerTokenFilter.USER_ATTRIBUTE);
        jdbcTemplate.update(
                "INSERT INTO quiz_result (user_id, quiz_id, score, total_questions, max_streak, average_response_seconds) "
                        + "VALUES (?, ?, ?, ?, ?, ?)",
                user.id(),
                quiz.id(),
                result.correctAnswersCount(),
                result.totalQuestions(),
                result.maxConsecutiveCorrect(),
                result.averageResponseTimeSeconds()
        );
        return ResponseEntity.noContent().build();
    }

    public record ThemeResponse(String id, String name, String category) {
    }

    public record OptionResponse(String id, String text) {
    }

    public record QuestionResponse(String id, String questionText, List<OptionResponse> options, String correctOptionId) {
    }

    public record ResultRequest(
            @NotBlank String themeId,
            @Min(0) int correctAnswersCount,
            @Min(0) int maxConsecutiveCorrect,
            @NotNull @DecimalMin("0.0") @DecimalMax("5.0") Double averageResponseTimeSeconds,
            @Positive int totalQuestions
    ) {
        public ResultRequest {
            if (correctAnswersCount > totalQuestions || maxConsecutiveCorrect > totalQuestions) {
                throw new IllegalArgumentException("Quiz statistics exceed total question count");
            }
        }
    }

    private record QuestionRow(long id, String statement, String optionKey, String answerText, boolean correct) {
    }

    private record QuizSummary(long id, int questionCount) {
    }

    private static final class QuestionBuilder {
        private final long id;
        private final String statement;
        private final List<OptionResponse> options = new ArrayList<>();
        private String correctOptionId;

        private QuestionBuilder(long id, String statement) {
            this.id = id;
            this.statement = statement;
        }

        private List<OptionResponse> options() {
            return options;
        }

        private void setCorrectOptionId(String value) {
            correctOptionId = value;
        }

        private QuestionResponse toResponse() {
            return new QuestionResponse(Long.toString(id), statement, options, correctOptionId);
        }
    }
}
