
package com.bizmate.bizmate_backend.controller;

import com.bizmate.bizmate_backend.entity.Chat;
import com.bizmate.bizmate_backend.entity.ChatMessage;
import com.bizmate.bizmate_backend.repository.ChatMessageRepository;
import com.bizmate.bizmate_backend.repository.ChatRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/chats/{chatId}/messages")
public class ChatMessageController {

    private final ChatMessageRepository messageRepository;
    private final ChatRepository chatRepository;

    public ChatMessageController(
            ChatMessageRepository messageRepository,
            ChatRepository chatRepository) {
        this.messageRepository = messageRepository;
        this.chatRepository = chatRepository;
    }

    @PostMapping
    public ResponseEntity<?> saveMessage(
            @PathVariable Integer chatId,
            @RequestBody Map<String, String> body) {

        Chat chat = chatRepository.findById(chatId).orElse(null);

        if (chat == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Chat not found"));
        }

        String roleText = body.get("role");
        String messageText = body.get("message");

        if (roleText == null || messageText == null
                || messageText.isBlank()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "role and message are required"));
        }

        ChatMessage.Role role;

        try {
            role = ChatMessage.Role.valueOf(roleText.toLowerCase());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "role must be user or assistant"));
        }

        ChatMessage message = new ChatMessage();
        message.setChat(chat);
        message.setRole(role);
        message.setMessage(messageText.trim());

        ChatMessage saved = messageRepository.save(message);

        return ResponseEntity.status(HttpStatus.CREATED).body(
                Map.of(
                        "id", saved.getId(),
                        "chatId", chatId,
                        "role", saved.getRole().name(),
                        "message", saved.getMessage(),
                        "status", "Message saved successfully"
                )
        );
    }

    @GetMapping
    public ResponseEntity<?> getMessages(@PathVariable Integer chatId) {

        if (!chatRepository.existsById(chatId)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Chat not found"));
        }

        List<Map<String, Object>> messages =
                messageRepository
                        .findByChatIdOrderByCreatedAtAsc(chatId)
                        .stream()
                        .map(message -> Map.<String, Object>of(
                                "id", message.getId(),
                                "role", message.getRole().name(),
                                "message", message.getMessage(),
                                "createdAt", message.getCreatedAt() == null
                                        ? "" : message.getCreatedAt().toString()
                        ))
                        .toList();

        return ResponseEntity.ok(messages);
    }
}
