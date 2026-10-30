package com.example.backendquizz.service;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class FriendDirectoryService {
    private final JdbcTemplate jdbcTemplate;

    public FriendDirectoryService(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public List<FriendSummary> listUsers(long currentUserId) {
        return jdbcTemplate.query(
                "SELECT u.id, u.username, EXISTS (SELECT 1 FROM user_friend f "
                        + "WHERE f.user_id = ? AND f.friend_id = u.id) AS is_friend "
                        + "FROM app_user u WHERE u.id <> ? ORDER BY LOWER(u.username), u.id",
                (rs, row) -> new FriendSummary(rs.getLong("id"), rs.getString("username"), rs.getBoolean("is_friend")),
                currentUserId,
                currentUserId
        );
    }

    public boolean userExists(long userId) {
        Integer count = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM app_user WHERE id = ?",
                Integer.class,
                userId
        );
        return count != null && count > 0;
    }

    @Transactional
    public void addFriend(long currentUserId, long friendId) {
        jdbcTemplate.update("INSERT INTO user_friend (user_id, friend_id) VALUES (?, ?)", currentUserId, friendId);
        jdbcTemplate.update("INSERT INTO user_friend (user_id, friend_id) VALUES (?, ?)", friendId, currentUserId);
    }

    @Transactional
    public void removeFriend(long currentUserId, long friendId) {
        jdbcTemplate.update("DELETE FROM user_friend WHERE (user_id = ? AND friend_id = ?) OR (user_id = ? AND friend_id = ?)",
                currentUserId, friendId, friendId, currentUserId);
    }

    public record FriendSummary(long id, String username, boolean isFriend) { }
}
