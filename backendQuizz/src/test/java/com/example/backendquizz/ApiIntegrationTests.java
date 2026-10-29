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
                .andExpect(jsonPath("$", hasSize(3)))
                .andExpect(jsonPath("$[?(@.id == 'java')].name").value("Java & Spring Boot"));

        mockMvc.perform(get("/api/quiz/themes/java/questions"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(3)))
                .andExpect(jsonPath("$[0].options", hasSize(4)))
                .andExpect(jsonPath("$[0].correctOptionId").value("abstract"));
    }

    @Test
    void registrationLoginResultsProfileAndLogoutWorkEndToEnd() throws Exception {
        String username = "user_" + UUID.randomUUID().toString().substring(0, 8);
        String credentials = "{\"username\":\"" + username
                + "\",\"password\":\"a-strong-password\"}";

        mockMvc.perform(post("/api/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(credentials))
                .andExpect(status().isCreated());

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
                        .content("""
                                {"themeId":"java","correctAnswersCount":2,"maxConsecutiveCorrect":2,
                                 "averageResponseTimeSeconds":2.5,"totalQuestions":3}
                                """))
                .andExpect(status().isNoContent());

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
                                {"themeId":"java","correctAnswersCount":9,"maxConsecutiveCorrect":2,
                                 "averageResponseTimeSeconds":1,"totalQuestions":3}
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
