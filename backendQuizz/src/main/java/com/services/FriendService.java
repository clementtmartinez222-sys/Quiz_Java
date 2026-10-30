package com.services;

import com.models.Friend;
import com.repositories.FriendRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class FriendService {
    private final FriendRepository friendRepository;

    public FriendService(FriendRepository friendRepository) {
        this.friendRepository = friendRepository;
    }

    public List<Friend> getAllFriends() {
        return friendRepository.findAll();
    }

    public Optional<Friend> getFriendById(Long id) {
        return friendRepository.findById(id);
    }

    public Friend createFriend(Friend friend) {
        return friendRepository.save(friend);
    }
}
