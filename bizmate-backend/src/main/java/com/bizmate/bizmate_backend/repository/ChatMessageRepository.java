
package com.bizmate.bizmate_backend.repository;

import com.bizmate.bizmate_backend.entity.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ChatMessageRepository
        extends JpaRepository<ChatMessage, Integer> {

    List<ChatMessage> findByChatIdOrderByCreatedAtAsc(Integer chatId);
}
