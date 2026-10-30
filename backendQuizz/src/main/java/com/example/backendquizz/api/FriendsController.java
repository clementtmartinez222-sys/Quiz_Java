package com.example.backendquizz.api;

import com.example.backendquizz.service.FriendDirectoryService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/friends")
public class FriendsController {
    private final FriendDirectoryService friends;

    public FriendsController(FriendDirectoryService friends) {
        this.friends = friends;
    }

    @GetMapping
    public List<FriendDirectoryService.FriendSummary> list(HttpServletRequest request) {
        return friends.listUsers(currentUser(request).id());
    }

    @PostMapping("/{userId}")
    public ResponseEntity<Void> add(@PathVariable long userId, HttpServletRequest request) {
        long currentUserId = currentUser(request).id();
        if (userId == currentUserId || !friends.userExists(userId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found");
        }
        try {
            friends.addFriend(currentUserId, userId);
        } catch (DataIntegrityViolationException exception) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "User is already a friend");
        }
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{userId}")
    public ResponseEntity<Void> remove(@PathVariable long userId, HttpServletRequest request) {
        friends.removeFriend(currentUser(request).id(), userId);
        return ResponseEntity.noContent().build();
    }

    private AuthenticatedUser currentUser(HttpServletRequest request) {
        return (AuthenticatedUser) request.getAttribute(BearerTokenFilter.USER_ATTRIBUTE);
    }
}
