package com.bizmate.bizmate_backend.controller;

import com.bizmate.bizmate_backend.dto.LoginRequest;
import com.bizmate.bizmate_backend.dto.RegisterRequest;
import com.bizmate.bizmate_backend.entity.User;
import com.bizmate.bizmate_backend.service.AuthService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        try {
            User user = authService.register(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(
                    Map.of(
                            "message", "Registration successful",
                            "id", user.getId(),
                            "fullName", user.getFullName(),
                            "email", user.getEmail()
                    )
            );
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(
                    Map.of("error", e.getMessage())
            );
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            User user = authService.login(request);
            return ResponseEntity.ok(
                    Map.of(
                            "message", "Login successful",
                            "id", user.getId(),
                            "fullName", user.getFullName(),
                            "email", user.getEmail()
                    )
            );
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(
                    Map.of("error", e.getMessage())
            );
        }
    }
}
