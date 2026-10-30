package com.example.backendquizz.api;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.security.SecureRandom;
import java.nio.charset.StandardCharsets;
import java.sql.Timestamp;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Base64;
import java.util.List;

@RestController
@RequestMapping("/api")
public class AuthController {
    private static final SecureRandom SECURE_RANDOM = new SecureRandom();
    private static final PasswordEncoder PASSWORD_ENCODER = new BCryptPasswordEncoder();
    private static final RowMapper<UserCredentials> USER_MAPPER = (resultSet, rowNumber) ->
            new UserCredentials(
                    resultSet.getLong("id"),
                    resultSet.getString("username"),
                    resultSet.getString("password_hash")
            );

    private final JdbcTemplate jdbcTemplate;

    public AuthController(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @PostMapping("/register")
    @Transactional
    public ResponseEntity<LoginResponse> register(@Valid @RequestBody RegisterRequest request) {
        if (request.password().getBytes(StandardCharsets.UTF_8).length > 72) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Password exceeds 72 UTF-8 bytes");
        }
        String username = request.username().trim();
        try {
            jdbcTemplate.update(
                    "INSERT INTO app_user (username, password_hash) VALUES (?, ?)",
                    username,
                    PASSWORD_ENCODER.encode(request.password())
            );
        } catch (DataIntegrityViolationException exception) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Username is already in use");
        }
        UserCredentials user = jdbcTemplate.queryForObject(
                "SELECT id, username, password_hash FROM app_user WHERE username = ?",
                USER_MAPPER,
                username
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(createSession(user));
    }

    @PostMapping("/login")
    public LoginResponse login(@Valid @RequestBody LoginRequest request) {
        List<UserCredentials> users = jdbcTemplate.query(
                "SELECT id, username, password_hash FROM app_user WHERE username = ?",
                USER_MAPPER,
                request.username().trim()
        );
        if (users.isEmpty() || !PASSWORD_ENCODER.matches(request.password(), users.get(0).passwordHash())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid username or password");
        }

        UserCredentials user = users.get(0);
        return createSession(user);
    }

    private LoginResponse createSession(UserCredentials user) {
        byte[] randomToken = new byte[32];
        SECURE_RANDOM.nextBytes(randomToken);
        String token = Base64.getUrlEncoder().withoutPadding().encodeToString(randomToken);
        Instant expiresAt = Instant.now().plus(24, ChronoUnit.HOURS);
        jdbcTemplate.update(
                "INSERT INTO auth_session (user_id, token_hash, expires_at) VALUES (?, ?, ?)",
                user.id(),
                TokenSupport.hash(token),
                Timestamp.from(expiresAt)
        );
        return new LoginResponse(token);
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletRequest request) {
        AuthenticatedUser user = (AuthenticatedUser) request.getAttribute(BearerTokenFilter.USER_ATTRIBUTE);
        String token = request.getHeader("Authorization").substring("Bearer ".length()).trim();
        jdbcTemplate.update("DELETE FROM auth_session WHERE user_id = ? AND token_hash = ?", user.id(), TokenSupport.hash(token));
        return ResponseEntity.noContent().build();
    }

    public record RegisterRequest(
            @NotBlank @Size(max = 100) String username,
            @NotBlank @Size(min = 8, max = 72) String password
    ) {
    }

    public record LoginRequest(@NotBlank @Size(max = 100) String username, @NotBlank String password) {
    }

    public record LoginResponse(String token) {
    }

    private record UserCredentials(long id, String username, String passwordHash) {
    }
}
