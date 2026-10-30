package com.controllers;

import com.models.Friend;
import com.services.FriendService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/friends")
public class FriendController {
    private final FriendService friendService;

    public FriendController(FriendService friendService) {
        this.friendService = friendService;
    }

    @GetMapping
    public List<Friend> getAllFriends() {
        return friendService.getAllFriends();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Friend> getFriendById(@PathVariable Long id) {
        return friendService.getFriendById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Friend> createFriend(@RequestBody Friend friend) {
        Friend savedFriend = friendService.createFriend(friend);
        return ResponseEntity.status(201).body(savedFriend);
    }
}
