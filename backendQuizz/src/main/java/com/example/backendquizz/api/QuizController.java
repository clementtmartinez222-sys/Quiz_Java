package com.example.backendquizz.api;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
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

    public QuizController(JdbcTemplate jdbcTemplate) { this.jdbcTemplate = jdbcTemplate; }

    @GetMapping("/themes")
    public List<ThemeResponse> getThemes() {
        return jdbcTemplate.query("SELECT slug, title, category FROM quiz WHERE is_active=true ORDER BY category, title",
                (rs, row) -> new ThemeResponse(rs.getString("slug"), rs.getString("title"), rs.getString("category")));
    }

    @GetMapping("/themes/{themeId}/questions")
    public List<QuestionResponse> getQuestions(@PathVariable String themeId) {
        List<QuestionRow> rows = jdbcTemplate.query(
                "SELECT question.id question_id, question.statement, answer.option_key, answer.answer_text "
                        + "FROM quiz JOIN question ON question.quiz_id=quiz.id JOIN answer ON answer.question_id=question.id "
                        + "WHERE quiz.slug=? AND quiz.is_active=true ORDER BY question.id, answer.id",
                (rs, row) -> new QuestionRow(rs.getLong("question_id"), rs.getString("statement"),
                        rs.getString("option_key"), rs.getString("answer_text")), themeId);
        Map<Long, QuestionBuilder> questions = new LinkedHashMap<>();
        for (QuestionRow item : rows) questions.computeIfAbsent(item.id(), id -> new QuestionBuilder(id, item.statement()))
                .options().add(new OptionResponse(item.optionKey(), item.answerText()));
        return questions.values().stream().map(QuestionBuilder::toResponse).toList();
    }

    @PostMapping("/grade")
    public GradeResponse gradeGuest(@Valid @RequestBody ResultRequest request) { return grade(request); }

    @PostMapping("/results")
    public ResponseEntity<GradeResponse> submitResult(@Valid @RequestBody ResultRequest request, HttpServletRequest httpRequest) {
        GradeResponse grade = grade(request);
        AuthenticatedUser user = (AuthenticatedUser) httpRequest.getAttribute(BearerTokenFilter.USER_ATTRIBUTE);
        Long quizId = jdbcTemplate.queryForObject("SELECT id FROM quiz WHERE slug=?", Long.class, request.themeId());
        jdbcTemplate.update("INSERT INTO quiz_result (user_id, quiz_id, score, total_questions, max_streak, average_response_seconds) VALUES (?, ?, ?, ?, ?, ?)",
                user.id(), quizId, grade.correctAnswersCount(), grade.totalQuestions(), grade.maxConsecutiveCorrect(), grade.averageResponseTimeSeconds());
        return ResponseEntity.ok(grade);
    }

    private GradeResponse grade(ResultRequest request) {
        List<CorrectAnswer> rows = jdbcTemplate.query(
                "SELECT question.id question_id, answer.option_key FROM quiz "
                        + "JOIN question ON question.quiz_id=quiz.id JOIN answer ON answer.question_id=question.id "
                        + "WHERE quiz.slug=? AND quiz.is_active=true AND answer.is_correct=true ORDER BY question.id", (rs, row) ->
                        new CorrectAnswer(rs.getLong("question_id"), rs.getString("option_key")), request.themeId());
        if (rows.isEmpty()) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Quiz theme not found or empty");
        if (request.answers().size() != rows.size()) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Answer count does not match the quiz");
        Map<String, String> correct = new LinkedHashMap<>();
        rows.forEach(row -> correct.put(Long.toString(row.questionId()), row.optionKey()));
        Map<String, AnswerSubmission> submitted = new LinkedHashMap<>();
        for (AnswerSubmission answer : request.answers()) {
            if (!correct.containsKey(answer.questionId()) || submitted.put(answer.questionId(), answer) != null)
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unknown or duplicate question answer");
            if (answer.selectedOptionId() != null) {
                Integer validOption = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM answer WHERE question_id=? AND option_key=?",
                        Integer.class, Long.parseLong(answer.questionId()), answer.selectedOptionId());
                if (validOption == null || validOption == 0) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Answer option does not belong to question");
            }
        }
        int score = 0, streak = 0, maxStreak = 0;
        double elapsed = 0;
        for (CorrectAnswer answer : rows) {
            AnswerSubmission submittedAnswer = submitted.get(Long.toString(answer.questionId()));
            if (answer.optionKey().equals(submittedAnswer.selectedOptionId())) { score++; streak++; maxStreak = Math.max(maxStreak, streak); }
            else streak = 0;
            elapsed += submittedAnswer.responseTimeSeconds();
        }
        return new GradeResponse(score, maxStreak, Math.round(elapsed / rows.size() * 100.0) / 100.0, rows.size(), correct);
    }

    public record ThemeResponse(String id, String name, String category) {}
    public record OptionResponse(String id, String text) {}
    public record QuestionResponse(String id, String questionText, List<OptionResponse> options) {}
    public record AnswerSubmission(@NotBlank String questionId, String selectedOptionId,
                                   @NotNull @DecimalMin("0.0") @DecimalMax("10.0") Double responseTimeSeconds) {}
    public record ResultRequest(@NotBlank String themeId, @NotEmpty List<@Valid AnswerSubmission> answers) {}
    public record GradeResponse(int correctAnswersCount, int maxConsecutiveCorrect, double averageResponseTimeSeconds,
                                int totalQuestions, Map<String, String> correctOptionIds) {}
    private record QuestionRow(long id, String statement, String optionKey, String answerText) {}
    private record CorrectAnswer(long questionId, String optionKey) {}
    private static final class QuestionBuilder {
        private final long id; private final String statement; private final List<OptionResponse> options = new ArrayList<>();
        private QuestionBuilder(long id, String statement) { this.id = id; this.statement = statement; }
        private List<OptionResponse> options() { return options; }
        private QuestionResponse toResponse() { return new QuestionResponse(Long.toString(id), statement, options); }
    }
}
