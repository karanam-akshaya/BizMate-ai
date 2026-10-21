package com.BizMate.backend.controller;

import com.BizMate.backend.service.GeminiService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/business")
@CrossOrigin(origins = "http://localhost:5173")
public class BusinessController {

    private final GeminiService geminiService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public BusinessController(GeminiService geminiService) {
        this.geminiService = geminiService;
    }

    @GetMapping("/test")
    public String test() {
        return "Business Assistant Backend is working!";
    }

    @PostMapping("/answers")
    public ResponseEntity<Map<String, Object>> analyzeBusiness(
            @RequestBody Map<String, String> answers) {

        try {
            // Convert the frontend answers into a String.
            String details = objectMapper.writeValueAsString(answers);

            // GeminiService expects String, not Map<String, String>.
            String result = geminiService.analyzeBusiness(details);

            // Convert Gemini's JSON response into a JSON object.
            JsonNode analysis = objectMapper.readTree(result);

            if (!analysis.isObject()
                    || !analysis.has("verdict")
                    || !analysis.has("successRate")
                    || !analysis.has("summary")) {

                throw new RuntimeException(
                        "Gemini response is missing required fields."
                );
            }

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("analysis", analysis);
            response.put(
                    "message",
                    "Business analysis generated successfully."
            );

            return ResponseEntity.ok(response);

        } catch (Exception e) {

            e.printStackTrace();

            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put(
                    "message",
                    "Could not generate the business analysis."
            );
            error.put("error", e.getMessage());

            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(error);
        }
    }
}