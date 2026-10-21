package com.BizMate.backend.service;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

@Service
public class NewsService {

    private final RestClient restClient;
    private final String apiKey;

    public NewsService(
            @Value("${news.api.key:}") String apiKey) {

        this.apiKey = apiKey;

        this.restClient = RestClient.builder()
                .baseUrl("https://newsapi.org")
                .build();
    }

    public List<Map<String, Object>> getBusinessNews() {

        if (apiKey == null || apiKey.isBlank()) {
            throw new IllegalStateException(
                    "NewsAPI key is missing. Set the NEWS_API_KEY environment variable."
            );
        }

        Map<?, ?> response = restClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/v2/top-headlines")
                        .queryParam("category", "business")
                        .queryParam("language", "en")
                        .queryParam("pageSize", 10)
                        .build())
                .header(HttpHeaders.ACCEPT, "application/json")
                .header("X-Api-Key", apiKey)
                .retrieve()
                .body(Map.class);

        if (response == null ||
                !(response.get("articles") instanceof List<?> articles)) {
            throw new IllegalStateException(
                    "NewsAPI returned an invalid response."
            );
        }

        return articles.stream()
                .filter(item -> item instanceof Map<?, ?>)
                .map(item -> {
                    Map<?, ?> article = (Map<?, ?>) item;
                    Object sourceObject = article.get("source");

                    String source = "Business News";

                    if (sourceObject instanceof Map<?, ?> sourceMap
                            && sourceMap.get("name") != null) {
                        source = sourceMap.get("name").toString();
                    }

                    return Map.<String, Object>of(
                            "title", safe(article.get("title")),
                            "description", safe(article.get("description")),
                            "url", safe(article.get("url")),
                            "urlToImage", safe(article.get("urlToImage")),
                            "publishedAt", safe(article.get("publishedAt")),
                            "source", source
                    );
                })
                .toList();
    }

    private String safe(Object value) {
        return value == null ? "" : value.toString();
    }
}