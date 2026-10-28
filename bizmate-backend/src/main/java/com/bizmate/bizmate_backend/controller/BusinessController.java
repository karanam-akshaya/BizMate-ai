
package com.bizmate.bizmate_backend.controller;

import com.bizmate.bizmate_backend.entity.BusinessAnalysis;
import com.bizmate.bizmate_backend.entity.User;
import com.bizmate.bizmate_backend.repository.BusinessAnalysisRepository;
import com.bizmate.bizmate_backend.repository.UserRepository;
import com.bizmate.bizmate_backend.service.GeminiService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/business")
@CrossOrigin(origins = {
        "http://localhost:3000",
        "http://localhost:5173"
})
public class BusinessController {

    private final GeminiService geminiService;
    private final BusinessAnalysisRepository businessAnalysisRepository;
    private final UserRepository userRepository;

    public BusinessController(
            GeminiService geminiService,
            BusinessAnalysisRepository businessAnalysisRepository,
            UserRepository userRepository) {
        this.geminiService = geminiService;
        this.businessAnalysisRepository = businessAnalysisRepository;
        this.userRepository = userRepository;
    }

    @PostMapping("/analyze")
    public ResponseEntity<Map<String, Object>> analyzeBusiness(
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

        if (request.getUserId() == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "User ID is required. Please log in first."
            );
        }

        // 2. Find the user who requested the analysis
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "User not found. Please log in again."
                ));

        // 3. Read the business details
        String businessIdea = request.getBusinessIdea().trim();
        String location = request.getLocation().trim();
        String budget = request.getBudget().trim();

        String targetAudience = defaultIfBlank(
                request.getTargetAudience(),
                "Not specified"
        );

        String topic = request.getTopic() == null
                ? ""
                : request.getTopic().trim();

        // 4. Generate the analysis using Gemini
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

        // 5. Check that Gemini returned a result
        if (analysis == null || analysis.isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_GATEWAY,
                    "Gemini returned an empty analysis. Please try again."
            );
        }

        // 6. Save the analysis in MySQL
        BusinessAnalysis savedAnalysis = new BusinessAnalysis();
        savedAnalysis.setUser(user);
        savedAnalysis.setBusinessIdea(businessIdea);
        savedAnalysis.setLocation(location);
        savedAnalysis.setBudget(budget);
        savedAnalysis.setTargetAudience(targetAudience);
        savedAnalysis.setTopic(topic);
        savedAnalysis.setAnalysisResult(analysis);

        BusinessAnalysis saved =
                businessAnalysisRepository.save(savedAnalysis);

        // 7. Return the result and saved record ID to React
        Map<String, Object> response = new HashMap<>();
        response.put("analysis", analysis);
        response.put("id", saved.getId());

        return ResponseEntity.ok(response);
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }

    private String defaultIfBlank(String value, String defaultValue) {
        return isBlank(value) ? defaultValue : value.trim();
    }

    // Receives the request sent by the React frontend
    public static class AnalyzeRequest {

        private String businessIdea;
        private String location;
        private String budget;
        private String targetAudience;
        private String topic;
        private Integer userId;

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

        public Integer getUserId() {
            return userId;
        }

        public void setUserId(Integer userId) {
            this.userId = userId;
        }
    }
}
