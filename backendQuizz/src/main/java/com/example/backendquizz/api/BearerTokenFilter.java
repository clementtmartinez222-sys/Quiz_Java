package com.example.backendquizz.api;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
public class BearerTokenFilter extends OncePerRequestFilter {
    public static final String USER_ATTRIBUTE = AuthenticatedUser.class.getName();
    private static final RowMapper<AuthenticatedUser> USER_MAPPER = (resultSet, rowNumber) ->
            new AuthenticatedUser(resultSet.getLong("id"), resultSet.getString("username"));

    private final JdbcTemplate jdbcTemplate;

    public BearerTokenFilter(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI().substring(request.getContextPath().length());
        return !path.equals("/api/profile")
                && !path.equals("/api/quiz/results")
                && !path.equals("/api/logout")
                && !path.equals("/api/friends")
                && !path.startsWith("/api/friends/");
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {
        String authorization = request.getHeader("Authorization");
        if (authorization == null || !authorization.startsWith("Bearer ")
                || authorization.length() <= "Bearer ".length()) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            return;
        }

        String tokenHash = TokenSupport.hash(authorization.substring("Bearer ".length()).trim());
        List<AuthenticatedUser> users = jdbcTemplate.query(
                "SELECT u.id, u.username FROM auth_session s "
                        + "JOIN app_user u ON u.id = s.user_id "
                        + "WHERE s.token_hash = ? AND s.expires_at > CURRENT_TIMESTAMP",
                USER_MAPPER,
                tokenHash
        );
        if (users.isEmpty()) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            return;
        }

        request.setAttribute(USER_ATTRIBUTE, users.get(0));
        filterChain.doFilter(request, response);
    }
}
