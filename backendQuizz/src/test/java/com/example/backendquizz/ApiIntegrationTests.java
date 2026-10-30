package com.example.backendquizz;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.web.servlet.MockMvc;

import java.util.UUID;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(properties = {
        "spring.datasource.url=jdbc:h2:mem:quizz;MODE=PostgreSQL;DB_CLOSE_DELAY=-1",
        "spring.datasource.username=sa",
        "spring.datasource.password=",
        "spring.datasource.driver-class-name=org.h2.Driver"
})
@AutoConfigureMockMvc
class ApiIntegrationTests {
    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Test
    void quizThemesAndQuestionsAreLoadedFromTheDatabase() throws Exception {
        mockMvc.perform(get("/api/quiz/themes"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(18)))
                .andExpect(jsonPath("$[?(@.id == 'java')].name").value("Java & Spring Boot"));

        mockMvc.perform(get("/api/quiz/themes/java/questions"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(3)))
                .andExpect(jsonPath("$[0].options", hasSize(4)))
                .andExpect(jsonPath("$[0].correctOptionId").doesNotExist());

        mockMvc.perform(get("/api/quiz/themes/espace/questions"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(4)));
        mockMvc.perform(get("/api/quiz/themes/java-fondamentaux/questions"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(0)));
        mockMvc.perform(get("/api/quiz/themes/musique-instruments/questions"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(3)));
    }

    @Test
    void revisionSheetsAreLoadedFromTheDatabase() throws Exception {
        mockMvc.perform(get("/api/sheets"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(18)))
                .andExpect(jsonPath("$[0].notions").isArray())
                .andExpect(jsonPath("$[0].quizId").isNotEmpty());
        org.junit.jupiter.api.Assertions.assertEquals(0,
                jdbcTemplate.queryForObject("SELECT COUNT(*) FROM quiz q LEFT JOIN revision_sheet s ON s.quiz_slug=q.slug WHERE s.id IS NULL", Integer.class));
        org.junit.jupiter.api.Assertions.assertEquals(0,
                jdbcTemplate.queryForObject("SELECT COUNT(*) FROM revision_sheet s LEFT JOIN quiz q ON q.slug=s.quiz_slug WHERE q.id IS NULL", Integer.class));
        org.junit.jupiter.api.Assertions.assertEquals(0,
                jdbcTemplate.queryForObject("SELECT COUNT(*) FROM (SELECT category FROM quiz WHERE is_active=true GROUP BY category HAVING COUNT(*)<2) categories", Integer.class));
        org.junit.jupiter.api.Assertions.assertEquals(0,
                jdbcTemplate.queryForObject("SELECT COUNT(*) FROM (SELECT category FROM revision_sheet WHERE is_active=true GROUP BY category HAVING COUNT(*)<2) categories", Integer.class));
    }

    @Test
    void legacyCrudEndpointsAreDisabledByDefault() throws Exception {
        mockMvc.perform(get("/api/users")).andExpect(status().isNotFound());
        mockMvc.perform(get("/api/results")).andExpect(status().isNotFound());
        mockMvc.perform(get("/api/friends")).andExpect(status().isUnauthorized());
    }

    @Test
    void registeredAccountsAppearInTheAuthenticatedFriendsDirectory() throws Exception {
        String owner = "owner_" + UUID.randomUUID().toString().substring(0, 8);
        String other = "player_" + UUID.randomUUID().toString().substring(0, 8);
        String ownerCredentials = "{\"username\":\"" + owner + "\",\"password\":\"a-strong-password\"}";
        String otherCredentials = "{\"username\":\"" + other + "\",\"password\":\"a-strong-password\"}";
        mockMvc.perform(post("/api/register").contentType(MediaType.APPLICATION_JSON).content(ownerCredentials))
                .andExpect(status().isCreated());
        mockMvc.perform(post("/api/register").contentType(MediaType.APPLICATION_JSON).content(otherCredentials))
                .andExpect(status().isCreated());

        String login = mockMvc.perform(post("/api/login").contentType(MediaType.APPLICATION_JSON).content(ownerCredentials))
                .andExpect(status().isOk()).andReturn().getResponse().getContentAsString();
        Matcher tokenMatcher = Pattern.compile("\\\"token\\\":\\\"([^\\\"]+)\\\"").matcher(login);
        org.junit.jupiter.api.Assertions.assertTrue(tokenMatcher.find());
        String token = tokenMatcher.group(1);
        Long otherId = jdbcTemplate.queryForObject("SELECT id FROM app_user WHERE username = ?", Long.class, other);

        mockMvc.perform(get("/api/friends").header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[?(@.username == '" + other + "')].isFriend").value(false));
        mockMvc.perform(post("/api/friends/" + otherId).header("Authorization", "Bearer " + token))
                .andExpect(status().isNoContent());
        mockMvc.perform(get("/api/friends").header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[?(@.username == '" + other + "')].isFriend").value(true));
        mockMvc.perform(get("/api/leaderboard"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[?(@.username == '" + other + "')].quizzesPlayed").value(0));
        mockMvc.perform(get("/api/friends")).andExpect(status().isUnauthorized());
    }

    @Test
    void registrationLoginResultsProfileAndLogoutWorkEndToEnd() throws Exception {
        String username = "user_" + UUID.randomUUID().toString().substring(0, 8);
        String credentials = "{\"username\":\"" + username
                + "\",\"password\":\"a-strong-password\"}";

        String registration = mockMvc.perform(post("/api/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(credentials))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andReturn().getResponse().getContentAsString();
        Matcher registrationTokenMatcher = Pattern.compile("\\\"token\\\":\\\"([^\\\"]+)\\\"").matcher(registration);
        org.junit.jupiter.api.Assertions.assertTrue(registrationTokenMatcher.find());
        mockMvc.perform(get("/api/profile").header("Authorization", "Bearer " + registrationTokenMatcher.group(1)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value(username));

        String login = mockMvc.perform(post("/api/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(credentials))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andReturn().getResponse().getContentAsString();
        Matcher tokenMatcher = Pattern.compile("\\\"token\\\":\\\"([^\\\"]+)\\\"").matcher(login);
        org.junit.jupiter.api.Assertions.assertTrue(tokenMatcher.find());
        String token = tokenMatcher.group(1);

        mockMvc.perform(post("/api/quiz/results")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(validAnswersPayload()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.correctAnswersCount").value(2))
                .andExpect(jsonPath("$.maxConsecutiveCorrect").value(2));

        mockMvc.perform(get("/api/profile").header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value(username))
                .andExpect(jsonPath("$.statistics.quizzesPlayed").value(1))
                .andExpect(jsonPath("$.statistics.averageScore").value(66.7))
                .andExpect(jsonPath("$.statistics.correctAnswers").value(2))
                .andExpect(jsonPath("$.statistics.bestStreak").value(2))
                .andExpect(jsonPath("$.statistics.recentResults[0].score").value("2 / 3"));

        mockMvc.perform(post("/api/logout").header("Authorization", "Bearer " + token))
                .andExpect(status().isNoContent());
        mockMvc.perform(get("/api/profile").header("Authorization", "Bearer " + token))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void rejectsDuplicateUsersAndInvalidResults() throws Exception {
        String username = "duplicate_" + UUID.randomUUID().toString().substring(0, 8);
        String credentials = "{\"username\":\"" + username
                + "\",\"password\":\"a-strong-password\"}";
        mockMvc.perform(post("/api/register").contentType(MediaType.APPLICATION_JSON).content(credentials))
                .andExpect(status().isCreated());
        mockMvc.perform(post("/api/register").contentType(MediaType.APPLICATION_JSON).content(credentials))
                .andExpect(status().isConflict());

        String login = mockMvc.perform(post("/api/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(credentials))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();
        Matcher tokenMatcher = Pattern.compile("\\\"token\\\":\\\"([^\\\"]+)\\\"").matcher(login);
        org.junit.jupiter.api.Assertions.assertTrue(tokenMatcher.find());

        mockMvc.perform(post("/api/quiz/results")
                        .header("Authorization", "Bearer " + tokenMatcher.group(1))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"themeId":"java","answers":[]}
                                """))
                .andExpect(status().isBadRequest());

        String oversizedUtf8Password = "{\"username\":\"unicode_"
                + UUID.randomUUID().toString().substring(0, 8)
                + "\",\"password\":\"" + "é".repeat(37) + "\"}";
        mockMvc.perform(post("/api/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(oversizedUtf8Password))
                .andExpect(status().isBadRequest());
    }

    private String validAnswersPayload() {
        var questionIds = jdbcTemplate.queryForList("SELECT q.id FROM question q JOIN quiz z ON z.id=q.quiz_id WHERE z.slug='java' ORDER BY q.id", Long.class);
        StringBuilder json = new StringBuilder("{\"themeId\":\"java\",\"answers\":[");
        for (int i = 0; i < questionIds.size(); i++) {
            Long questionId = questionIds.get(i);
            String correct = jdbcTemplate.queryForObject("SELECT option_key FROM answer WHERE question_id=? AND is_correct=true", String.class, questionId);
            String selected = i < 2 ? correct : jdbcTemplate.queryForObject("SELECT option_key FROM answer WHERE question_id=? AND is_correct=false ORDER BY id LIMIT 1", String.class, questionId);
            if (i > 0) json.append(',');
            json.append("{\"questionId\":\"").append(questionId).append("\",\"selectedOptionId\":\"")
                    .append(selected).append("\",\"responseTimeSeconds\":2}");
        }
        return json.append("]}").toString();
    }

    @Test
    void storesValidContactMessagesAndRejectsUnauthenticatedProfileRequests() throws Exception {
        mockMvc.perform(post("/api/contact")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"name":"Alice","email":"alice@example.com","message":"A message long enough."}
                                """))
                .andExpect(status().isOk())
                .andExpect(content().string("Votre message a bien été enregistré."));
        org.junit.jupiter.api.Assertions.assertEquals(
                1,
                jdbcTemplate.queryForObject("SELECT COUNT(*) FROM contact_message WHERE email = ?", Integer.class, "alice@example.com")
        );

        mockMvc.perform(get("/api/profile")).andExpect(status().isUnauthorized());
    }
}
