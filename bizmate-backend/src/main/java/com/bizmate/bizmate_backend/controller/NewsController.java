
package com.bizmate.bizmate_backend.controller;

import com.bizmate.bizmate_backend.service.NewsService;
import com.bizmate.bizmate_backend.service.NewsSummaryService;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;

@RestController
@RequestMapping("/api/news")
@CrossOrigin(origins = {
    "http://localhost:5173",
    "http://localhost:3000"
})
public class NewsController {

    private final NewsService newsService;
    private final NewsSummaryService summaryService;

    public NewsController(
            NewsService newsService,
            NewsSummaryService summaryService) {

        this.newsService = newsService;
        this.summaryService = summaryService;
    }

    // Get top headlines or news for a selected business category.
    //
    // Examples:
    // GET /api/news?category=top
    // GET /api/news?category=startups
    // GET /api/news?category=markets
    // GET /api/news?category=technology
    // GET /api/news?category=small-business
    // GET /api/news?category=ecommerce
    // GET /api/news?category=agriculture

    @GetMapping
    public Map<String, Object> getNews(
            @RequestParam(defaultValue = "top") String category) {

        if (category == null || category.isBlank()) {
            category = "top";
        }

        return newsService.getNews(category.trim());
    }

    // Get business success-story articles.
    //
    // Example:
    // GET /api/news/success-stories

    @GetMapping("/success-stories")
    public Map<String, Object> getSuccessStories() {

        return newsService.getNews("success-stories");
    }

    // Generate an AI summary for a selected news article using Gemini.
    //
    // Example:
    // GET /api/news/summary?title=Business%20News
    //
    // The frontend should send the article's title, description,
    // content and source as query parameters.

    @GetMapping("/summary")
    public Map<String, String> summarize(
            @RequestParam String title,
            @RequestParam(defaultValue = "") String description,
            @RequestParam(defaultValue = "") String content,
            @RequestParam(defaultValue = "") String source) {

        if (title == null || title.isBlank()) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "An article title is required."
            );
        }

        return summaryService.summarize(
            title.trim(),
            description,
            content,
            source
        );
    }
}
