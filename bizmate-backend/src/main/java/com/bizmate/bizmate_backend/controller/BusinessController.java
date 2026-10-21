
package com.bizmate.bizmate_backend.controller;

import com.bizmate.bizmate_backend.service.GeminiService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;

@RestController
@RequestMapping("/api/business")
@CrossOrigin(origins = {
        "http://localhost:3000",
        "http://localhost:5173"
})
public class BusinessController {

    private final GeminiService geminiService;

    public BusinessController(GeminiService geminiService) {
        this.geminiService = geminiService;
    }

    @PostMapping("/analyze")
    public ResponseEntity<Map<String, String>> analyzeBusiness(
            @RequestBody AnalyzeRequest request) {

        // 1. Validate the incoming request
        if (request == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Request body is required"
            );
        }

        if (isBlank(request.getBusinessIdea())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Business idea is required"
            );
        }

        if (isBlank(request.getLocation())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Location is required"
            );
        }

        if (isBlank(request.getBudget())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Budget is required"
            );
        }

        // 2. Read the business details
        String businessIdea = request.getBusinessIdea().trim();
        String location = request.getLocation().trim();
        String budget = request.getBudget().trim();

        String targetAudience = defaultIfBlank(
                request.getTargetAudience(),
                "Not specified"
        );

        // An empty topic requests the initial business summary.
        // A selected topic requests a detailed, topic-specific analysis.
        String topic = request.getTopic() == null
                ? ""
                : request.getTopic().trim();

        // 3. Send all details to GeminiService
        String analysis;

        try {
            analysis = geminiService.analyze(
                    businessIdea,
                    location,
                    budget,
                    targetAudience,
                    topic
            );
        } catch (IllegalArgumentException exception) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    exception.getMessage()
            );
        } catch (Exception exception) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_GATEWAY,
                    "Business analysis could not be generated. "
                            + "Please check the backend logs and Gemini API configuration."
            );
        }

        // 4. Validate Gemini's response
        if (analysis == null || analysis.isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_GATEWAY,
                    "Gemini returned an empty analysis. Please try again."
            );
        }

        // 5. Return the result to React as JSON
        return ResponseEntity.ok(
                Map.of("analysis", analysis)
        );
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }

    private String defaultIfBlank(String value, String defaultValue) {
        return isBlank(value) ? defaultValue : value.trim();
    }

    // Request model: receives data sent by the React frontend
    public static class AnalyzeRequest {

        private String businessIdea;
        private String location;
        private String budget;
        private String targetAudience;
        private String topic;

        public AnalyzeRequest() {
        }

        public String getBusinessIdea() {
            return businessIdea;
        }

        public void setBusinessIdea(String businessIdea) {
            this.businessIdea = businessIdea;
        }

        public String getLocation() {
            return location;
        }

        public void setLocation(String location) {
            this.location = location;
        }

        public String getBudget() {
            return budget;
        }

        public void setBudget(String budget) {
            this.budget = budget;
        }

        public String getTargetAudience() {
            return targetAudience;
        }

        public void setTargetAudience(String targetAudience) {
            this.targetAudience = targetAudience;
        }

        public String getTopic() {
            return topic;
        }

        public void setTopic(String topic) {
            this.topic = topic;
        }
    }
}
