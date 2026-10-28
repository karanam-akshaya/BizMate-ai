
package com.bizmate.bizmate_backend.repository;

import com.bizmate.bizmate_backend.entity.BusinessAnalysis;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BusinessAnalysisRepository
        extends JpaRepository<BusinessAnalysis, Integer> {

    List<BusinessAnalysis> findByUserIdOrderByCreatedAtDesc(
            Integer userId
    );
}
