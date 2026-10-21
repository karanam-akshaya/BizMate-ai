
package com.bizmate.bizmate_backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@Service
public class NewsService {

    @Value("${gnews.api.key:}")
    private String apiKey;

    private final RestClient restClient = RestClient.builder().build();

    public Map<String, Object> getNews(String requestedCategory) {

        // 1. Check the GNews API key.
        if (apiKey == null || apiKey.isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.SERVICE_UNAVAILABLE,
                    "GNews API key is not configured."
            );
        }

        // 2. Normalize the requested category.
        String category = requestedCategory == null
                || requestedCategory.isBlank()
                ? "top"
                : requestedCategory.trim().toLowerCase(Locale.ROOT);

        String endpoint;
        String newsCategory = "business";
        String query = null;
        String displayCategory;

        // 3. Select the GNews endpoint and search category.
        switch (category) {

            case "top":
            case "business":
            case "top-headlines":
                endpoint = "top-headlines";
                displayCategory = "Top Business Headlines";
                break;

            case "india":
                endpoint = "top-headlines";
                newsCategory = "nation";
                displayCategory = "India News";
                break;

            case "startups":
            case "startup":
            case "entrepreneurship":
                endpoint = "search";
                query = "startup OR entrepreneurship OR founders";
                displayCategory = "Startups & Entrepreneurship";
                break;

            case "markets":
            case "market":
                endpoint = "search";
                query = "stock market OR economy OR financial markets";
                displayCategory = "Business & Markets";
                break;

            case "technology":
            case "tech":
                endpoint = "top-headlines";
                newsCategory = "technology";
                displayCategory = "Technology & Innovation";
                break;

            case "small-business":
            case "smallbusiness":
            case "small-businesses":
                endpoint = "search";
                query = "\"small business\" OR MSME OR small enterprises";
                displayCategory = "Small Businesses";
                break;

            case "ecommerce":
            case "e-commerce":
                endpoint = "search";
                query = "e-commerce OR online retail OR digital commerce";
                displayCategory = "E-commerce";
                break;

            case "agriculture":
            case "farming":
                endpoint = "search";
                query = "agribusiness OR agricultural business OR agri-tech";
                displayCategory = "Agriculture & Farming";
                break;

            case "success-stories":
                endpoint = "search";
                query = "\"entrepreneur success story\" OR \"business founder\""
                        + " OR \"company founder\" OR \"business journey\"";
                displayCategory = "Business Success Stories";
                break;

            default:
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Unsupported news category: " + category
                );
        }

        try {
            final String selectedEndpoint = endpoint;
            final String selectedCategory = newsCategory;
            final String selectedQuery = query;

            // 4. Send the request to GNews.
            JsonNode response = restClient.get()
                    .uri(uriBuilder -> {
                        var builder = uriBuilder
                                .scheme("https")
                                .host("gnews.io")
                                .path("/api/v4/" + selectedEndpoint)
                                .queryParam("lang", "en")
                                .queryParam("country", "in")
                                .queryParam("max", 10)
                                .queryParam("apikey", apiKey.trim());

                        if ("search".equals(selectedEndpoint)) {
                            builder.queryParam("q", selectedQuery);
                        } else {
                            builder.queryParam(
                                    "category",
                                    selectedCategory
                            );
                        }

                        return builder.build();
                    })
                    .retrieve()
                    .body(JsonNode.class);

            // 5. Extract article information.
            List<Map<String, Object>> articles = new ArrayList<>();

            if (response != null && response.path("articles").isArray()) {

                for (JsonNode article : response.path("articles")) {

                    String title = article.path("title").asText("");
                    String url = article.path("url").asText("");

                    // Ignore incomplete article entries.
                    if (title.isBlank() || url.isBlank()) {
                        continue;
                    }

                    Map<String, Object> item = new LinkedHashMap<>();

                    item.put("title", title);
                    item.put(
                            "description",
                            article.path("description").asText("")
                    );
                    item.put(
                            "content",
                            article.path("content").asText("")
                    );
                    item.put(
                            "source",
                            article.path("source").path("name").asText("")
                    );
                    item.put(
                            "publishedAt",
                            article.path("publishedAt").asText("")
                    );
                    item.put("url", url);
                    item.put(
                            "imageUrl",
                            article.path("image").asText("")
                    );
                    item.put("category", displayCategory);

                    articles.add(item);
                }
            }

            // 6. Return data in the format expected by News.jsx.
            Map<String, Object> result = new LinkedHashMap<>();

            result.put("category", displayCategory);
            result.put("totalArticles", articles.size());
            result.put("articles", articles);

            return result;

        } catch (RestClientResponseException exception) {

            // Log GNews's status and response for troubleshooting.
            // Never log the API key.
            System.err.println(
                    "GNews HTTP status: "
                            + exception.getStatusCode()
            );

            System.err.println(
                    "GNews error response: "
                            + exception.getResponseBodyAsString()
            );

            throw new ResponseStatusException(
                    HttpStatus.BAD_GATEWAY,
                    "GNews request failed. Check the backend terminal."
            );

        } catch (ResponseStatusException exception) {
            throw exception;

        } catch (Exception exception) {

            System.err.println(
                    "News retrieval failed: "
                            + exception.getClass().getSimpleName()
            );

            throw new ResponseStatusException(
                    HttpStatus.BAD_GATEWAY,
                    "Unable to retrieve news. Please try again later."
            );
        }
    }
}
