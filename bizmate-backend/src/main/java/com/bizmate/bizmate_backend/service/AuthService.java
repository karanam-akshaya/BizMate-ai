package com.bizmate.bizmate_backend.service;

import com.bizmate.bizmate_backend.dto.LoginRequest;
import com.bizmate.bizmate_backend.dto.RegisterRequest;
import com.bizmate.bizmate_backend.entity.User;
import com.bizmate.bizmate_backend.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public User register(RegisterRequest request) {
        if (request.getFullName() == null ||
                request.getFullName().isBlank() ||
                request.getEmail() == null ||
                request.getEmail().isBlank() ||
                request.getPassword() == null ||
                request.getPassword().length() < 8) {
            throw new IllegalArgumentException(
                    "Name and email are required; password must be at least 8 characters.");
        }

        String email = request.getEmail().trim().toLowerCase();

        if (userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException(
                    "An account with this email already exists.");
        }

        User user = new User();
        user.setFullName(request.getFullName().trim());
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));

        return userRepository.save(user);
    }

    public User login(LoginRequest request) {
        if (request.getEmail() == null || request.getPassword() == null) {
            throw new IllegalArgumentException("Email and password are required.");
        }

        User user = userRepository.findByEmail(
                request.getEmail().trim().toLowerCase())
                .orElseThrow(() -> new IllegalArgumentException(
                        "Invalid email or password."));

        if (!passwordEncoder.matches(
                request.getPassword(), user.getPasswordHash())) {
            throw new IllegalArgumentException("Invalid email or password.");
        }

        return user;
    }
}
