
package com.bizmate.bizmate_backend.controller;

import com.bizmate.bizmate_backend.entity.UploadedFile;
import com.bizmate.bizmate_backend.entity.User;
import com.bizmate.bizmate_backend.repository.UploadedFileRepository;
import com.bizmate.bizmate_backend.repository.UserRepository;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/files")
public class FileUploadController {

    private final UploadedFileRepository fileRepository;
    private final UserRepository userRepository;

    private final Path uploadDirectory =
            Paths.get("uploads").toAbsolutePath().normalize();

    public FileUploadController(
            UploadedFileRepository fileRepository,
            UserRepository userRepository) {
        this.fileRepository = fileRepository;
        this.userRepository = userRepository;
    }

    @PostMapping("/upload")
    public ResponseEntity<?> uploadFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam("userId") Integer userId) {

        if (file.isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Please select a file."));
        }

        if (file.getSize() > 10 * 1024 * 1024) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Maximum file size is 10 MB."));
        }

        User user = userRepository.findById(userId).orElse(null);

        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "User not found."));
        }

        String originalName = Paths.get(
                file.getOriginalFilename() == null
                        ? "uploaded-file"
                        : file.getOriginalFilename()
        ).getFileName().toString();

        String storedName = UUID.randomUUID() + "_" + originalName;
        Path destination = uploadDirectory.resolve(storedName).normalize();

        if (!destination.startsWith(uploadDirectory)) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Invalid filename."));
        }

        try {
            Files.createDirectories(uploadDirectory);
            Files.copy(file.getInputStream(), destination);

            UploadedFile uploadedFile = new UploadedFile();
            uploadedFile.setUser(user);
            uploadedFile.setFileName(originalName);
            uploadedFile.setFilePath(destination.toString());
            uploadedFile.setFileType(file.getContentType());

            UploadedFile saved = fileRepository.save(uploadedFile);

            return ResponseEntity.status(HttpStatus.CREATED).body(
                    Map.of(
                            "message", "File uploaded successfully.",
                            "id", saved.getId(),
                            "fileName", saved.getFileName(),
                            "fileType", saved.getFileType() == null
                                    ? "" : saved.getFileType()
                    )
            );

        } catch (IOException e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Could not save the uploaded file."));
        }
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getUserFiles(
            @PathVariable Integer userId) {

        if (!userRepository.existsById(userId)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "User not found."));
        }

        List<Map<String, Object>> files =
                fileRepository.findByUserId(userId)
                        .stream()
                        .map(f -> Map.<String, Object>of(
                                "id", f.getId(),
                                "fileName", f.getFileName(),
                                "fileType", f.getFileType() == null
                                        ? "" : f.getFileType(),
                                "uploadedAt", f.getUploadedAt() == null
                                        ? "" : f.getUploadedAt().toString()
                        ))
                        .toList();

        return ResponseEntity.ok(files);
    }
}
