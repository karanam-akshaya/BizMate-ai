
package com.bizmate.bizmate_backend.repository;

import com.bizmate.bizmate_backend.entity.Chat;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ChatRepository extends JpaRepository<Chat, Integer> {

    List<Chat> findByUserIdOrderByCreatedAtDesc(Integer userId);
}
