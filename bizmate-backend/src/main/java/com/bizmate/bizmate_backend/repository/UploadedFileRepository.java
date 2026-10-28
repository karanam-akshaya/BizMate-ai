
package com.bizmate.bizmate_backend.repository;

import com.bizmate.bizmate_backend.entity.UploadedFile;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface UploadedFileRepository
        extends JpaRepository<UploadedFile, Integer> {

    List<UploadedFile> findByUserId(Integer userId);
}
