package com.BizMate.backend.controller;

import java.util.List;
import java.util.Map;

import com.BizMate.backend.service.NewsService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestClientResponseException;

@RestController
@RequestMapping("/api/news")
@CrossOrigin(origins = "http://localhost:5173")
public class NewsController {

    private final NewsService newsService;

    public NewsController(NewsService newsService) {
        this.newsService = newsService;
    }

    @GetMapping
    public ResponseEntity<?> getBusinessNews() {
        try {
            List<Map<String, Object>> news =
                    newsService.getBusinessNews();

            return ResponseEntity.ok(news);

        } catch (RestClientResponseException ex) {
            return ResponseEntity.status(ex.getStatusCode())
                    .body(Map.of(
                            "error", "NewsAPI request failed",
                            "details", ex.getResponseBodyAsString()
                    ));

        } catch (Exception ex) {
            return ResponseEntity.internalServerError()
                    .body(Map.of(
                            "error", "Unable to load business news",
                            "details", ex.getMessage() == null
                                    ? "Unknown error"
                                    : ex.getMessage()
                    ));
        }
    }
}