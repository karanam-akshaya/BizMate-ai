
package com.bizmate.bizmate_backend.controller;

import com.bizmate.bizmate_backend.entity.Chat;
import com.bizmate.bizmate_backend.entity.User;
import com.bizmate.bizmate_backend.repository.ChatRepository;
import com.bizmate.bizmate_backend.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/chats")
public class ChatController {

    private final ChatRepository chatRepository;
    private final UserRepository userRepository;

    public ChatController(
            ChatRepository chatRepository,
            UserRepository userRepository) {
        this.chatRepository = chatRepository;
        this.userRepository = userRepository;
    }

    @PostMapping
    public ResponseEntity<?> createChat(@RequestBody Map<String, Object> body) {
        Object userIdValue = body.get("userId");

        if (userIdValue == null) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "userId is required"));
        }

        try {
            Integer userId = Integer.valueOf(userIdValue.toString());

            User user = userRepository.findById(userId).orElse(null);

            if (user == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "User not found"));
            }

            Chat chat = new Chat();
            chat.setUser(user);

            Object titleValue = body.get("title");
            if (titleValue != null) {
                chat.setTitle(titleValue.toString());
            }

            Chat savedChat = chatRepository.save(chat);

            return ResponseEntity.status(HttpStatus.CREATED).body(
                    Map.of(
                            "id", savedChat.getId(),
                            "userId", userId,
                            "message", "Chat created successfully"
                    )
            );
        } catch (NumberFormatException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "userId must be a number"));
        }
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Map<String, Object>>> getUserChats(
            @PathVariable Integer userId) {

        List<Map<String, Object>> chats =
                chatRepository.findByUserIdOrderByCreatedAtDesc(userId)
                        .stream()
                        .map(chat -> Map.<String, Object>of(
                                "id", chat.getId(),
                                "title", chat.getTitle() == null
                                        ? "" : chat.getTitle(),
                                "createdAt", chat.getCreatedAt() == null
                                        ? "" : chat.getCreatedAt().toString()
                        ))
                        .toList();

        return ResponseEntity.ok(chats);
    }
}
