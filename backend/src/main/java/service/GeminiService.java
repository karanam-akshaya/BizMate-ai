
package com.BizMate.backend.service;

import com.google.genai.Client;
import com.google.genai.types.GenerateContentResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class GeminiService {

    private final Client client;

    public GeminiService(@Value("${gemini.api.key}") String apiKey) {
        this.client = Client.builder()
                .apiKey(apiKey)
                .build();
    }

    public String analyzeBusiness(String details) {

        String prompt = """
                You are an expert business advisor.

                Analyze these business details:
                %s

                Return ONLY valid JSON.
                Do not use markdown or code fences.
                The first character must be { and the last character must be }.

                Use this structure:

                {
                  "verdict": "Good Idea",
                  "verdictReason": "Short explanation",
                  "successRate": 75,
                  "summary": "A practical business assessment in 5 to 6 sentences.",
                  "factors": [
                    {
                      "title": "Target Customers",
                      "description": "Explain the target customers."
                    },
                    {
                      "title": "Competition",
                      "description": "Explain potential competition."
                    },
                    {
                      "title": "Budget",
                      "description": "Explain budget suitability."
                    },
                    {
                      "title": "Market Demand",
                      "description": "Explain potential demand."
                    }
                  ],
                  "proTips": [
                    {
                      "title": "Start Small",
                      "description": "Practical business advice."
                    },
                    {
                      "title": "Research Competitors",
                      "description": "Practical business advice."
                    },
                    {
                      "title": "Manage Budget",
                      "description": "Practical business advice."
                    }
                  ],
                  "businessIdeas": [
                    {
                      "name": "Alternative business idea",
                      "reason": "Why it may be suitable."
                    },
                    {
                      "name": "Alternative business idea",
                      "reason": "Why it may be suitable."
                    },
                    {
                      "name": "Alternative business idea",
                      "reason": "Why it may be suitable."
                    }
                  ],
                  "locations": [
                    {
                      "name": "Alternative location",
                      "reason": "Why it may be suitable."
                    },
                    {
                      "name": "Alternative location",
                      "reason": "Why it may be suitable."
                    },
                    {
                      "name": "Alternative location",
                      "reason": "Why it may be suitable."
                    }
                  ]
                }

                Rules:
                - successRate must be an integer between 0 and 100.
                - It is an approximate opportunity score, not a guaranteed
                  probability of success.
                - verdict must be one of:
                  "Very Good Idea", "Good Idea", "Average Idea", "Risky Idea".
                - Consider budget, location, customers, experience, goals,
                  business type and business size.
                - Do not invent verified competitor counts or market statistics.
                - Give specific, practical recommendations.
                - Return properly escaped JSON strings.
                """.formatted(details);

        GenerateContentResponse response = client.models.generateContent(
                "gemini-flash-latest",
                prompt,
                null
        );

        String result = response.text();

        if (result == null || result.isBlank()) {
            throw new RuntimeException("Gemini returned an empty response.");
        }

        result = result.trim();

        // Remove Markdown code fences if Gemini includes them.
        if (result.startsWith("```")) {
            result = result.replaceFirst("^```(?:json)?\\s*", "");
            result = result.replaceFirst("\\s*```$", "");
        }

        // Extract the JSON object.
        int start = result.indexOf('{');
        int end = result.lastIndexOf('}');

        if (start == -1 || end < start) {
            throw new RuntimeException(
                    "Gemini did not return a JSON object: " + result
            );
        }

        return result.substring(start, end + 1);
    }
}