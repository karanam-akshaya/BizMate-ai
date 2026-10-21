
package com.bizmate.bizmate_backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;

import java.util.List;
import java.util.Locale;
import java.util.Map;

@Service
public class GeminiService {

    private final RestClient restClient;
    private final ObjectMapper mapper;
    private final String apiKey;
    private final String model;
    private final String baseUrl;

    public GeminiService(
            @Value("${gemini.api.key}") String apiKey,
            @Value("${gemini.api.model}") String model,
            @Value("${gemini.api.url}") String baseUrl) {

        this.apiKey = apiKey;
        this.model = model;
        this.baseUrl = baseUrl;

        this.restClient = RestClient.create();
        this.mapper = new ObjectMapper();
    }

    /**
     * Generates the initial business report, a full report,
     * or a selected-topic answer.
     */
    public String analyze(
            String businessIdea,
            String location,
            String budget,
            String targetAudience,
            String topic) {

        String safeBusinessIdea =
                valueOrDefault(businessIdea, "Not specified");

        String safeLocation =
                valueOrDefault(location, "Not specified");

        String safeBudget =
                valueOrDefault(budget, "Not specified");

        String safeTargetAudience =
                valueOrDefault(targetAudience, "Not specified");

        String selectedTopic = topic == null ? "" : topic.trim();

        String prompt = buildPrompt(
                safeBusinessIdea,
                safeLocation,
                safeBudget,
                safeTargetAudience,
                selectedTopic
        );

        String endpoint =
                baseUrl.replaceAll("/+$", "")
                + "/models/"
                + model
                + ":generateContent";

        // Allow enough output for all seven sections.
        int maxTokens = selectedTopic.isBlank() ? 4500 : 4000;

        Map<String, Object> requestBody = Map.of(
                "contents", List.of(
                        Map.of(
                                "parts", List.of(
                                        Map.of("text", prompt)
                                )
                        )
                ),
                "generationConfig", Map.of(
                        "temperature", 0.3,
                        "maxOutputTokens", maxTokens
                )
        );

        try {
            System.out.println("Calling Gemini model: " + model);
            System.out.println(
                    "Analysis type: "
                    + (selectedTopic.isBlank()
                    ? "Initial Business Report"
                    : selectedTopic)
            );

            String response = restClient.post()
                    .uri(endpoint)
                    .header("x-goog-api-key", apiKey)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(requestBody)
                    .retrieve()
                    .body(String.class);

            if (response == null || response.isBlank()) {
                throw new IllegalStateException(
                        "Gemini returned an empty response."
                );
            }

            JsonNode json = mapper.readTree(response);

            String blockReason = json
                    .path("promptFeedback")
                    .path("blockReason")
                    .asText("");

            if (!blockReason.isBlank()) {
                throw new IllegalStateException(
                        "Gemini blocked the prompt: " + blockReason
                );
            }

            JsonNode candidates = json.path("candidates");
            StringBuilder result = new StringBuilder();

            if (candidates.isArray()) {
                for (JsonNode candidate : candidates) {

                    JsonNode parts = candidate
                            .path("content")
                            .path("parts");

                    if (!parts.isArray()) {
                        continue;
                    }

                    for (JsonNode part : parts) {
                        JsonNode textNode = part.path("text");

                        if (textNode.isTextual()) {
                            String text = textNode.asText().trim();

                            if (!text.isEmpty()) {
                                if (result.length() > 0) {
                                    result.append("\n\n");
                                }

                                result.append(text);
                            }
                        }
                    }

                    if (result.length() > 0) {
                        break;
                    }
                }
            }

            if (result.length() > 0) {
                return result.toString().trim();
            }

            System.err.println(
                    "Gemini returned no text. Response: " + response
            );

            throw new IllegalStateException(
                    "Gemini did not return readable text. "
                    + "Check the backend terminal for details."
            );

        } catch (RestClientResponseException e) {

            System.err.println(
                    "Gemini HTTP status: "
                    + e.getStatusCode().value()
            );

            System.err.println(
                    "Gemini error response: "
                    + e.getResponseBodyAsString()
            );

            throw new RuntimeException(
                    "Gemini API request failed with HTTP "
                    + e.getStatusCode().value()
                    + ". Check the API configuration and backend logs.",
                    e
            );

        } catch (Exception e) {

            System.err.println(
                    "Gemini analysis error: " + e.getMessage()
            );

            throw new RuntimeException(
                    "Unable to complete business analysis: "
                    + e.getMessage(),
                    e
            );
        }
    }

    /**
     * Creates the initial report, detailed report,
     * or response for a selected topic.
     */
    private String buildPrompt(
            String businessIdea,
            String location,
            String budget,
            String targetAudience,
            String topic) {

        String businessDetails = """
                USER QUESTIONNAIRE ANSWERS

                Business idea and additional details:
                %s

                Preferred location:
                %s

                Available budget:
                %s

                Target customers:
                %s
                """.formatted(
                businessIdea,
                location,
                budget,
                targetAudience
        );

        String normalizedTopic = topic == null
                ? ""
                : topic.trim().toLowerCase(Locale.ROOT);

        // 1. Initial report: all seven sections plus final recommendations.
        if (normalizedTopic.isBlank()) {

            return """
                    ROLE:
                    You are BizMate-AI, a practical and honest business
                    advisor who helps beginners evaluate business ideas.

                    OBJECTIVE:
                    Analyze the user's actual questionnaire answers.
                    Provide a complete but concise initial report.
                    Every required section must contain a meaningful answer.
                    Never omit a section simply to shorten the response.

                    The business idea field may contain additional details
                    such as business type, experience, goal, and business size.
                    Read these details and use them in your recommendations.

                    OUTPUT FORMAT:
                    Return Markdown only. Do not introduce yourself.

                    # BUSINESS VERDICT

                    Choose exactly ONE of these verdicts as the heading:
                    # WORTH PURSUING
                    # WORTH PURSUING WITH CHANGES
                    # NOT RECOMMENDED IN ITS CURRENT FORM

                    Immediately explain the verdict in 1–2 sentences.
                    Base it on the available information and identify
                    important uncertainties where appropriate.

                    ## Overall Summary

                    Write 3–4 concise sentences explaining:
                    - What the business offers.
                    - Its potential customers and possible opportunity.
                    - Whether the idea fits the stated budget.
                    - The most important thing to validate before investing.

                    ## 1. Target Customers

                    Explain the most relevant potential customers.
                    Describe their likely needs and why they might buy.
                    Suggest one practical way to reach these customers.

                    ## 2. Market and Competition

                    Explain the possible opportunity and likely alternatives
                    customers may already use.
                    Describe how this business could differentiate itself.
                    Recommend a practical way to research local competitors
                    and validate customer demand.

                    ## 3. Product, Service and Unique Value

                    Explain what the user should offer first.
                    Identify the customer problem the offer solves.
                    Suggest one realistic way to make the offer different
                    or more attractive than available alternatives.

                    ## 4. Marketing and Sales Strategy

                    Recommend affordable ways to attract first customers.
                    Include suitable online or offline channels.
                    Explain how to encourage repeat purchases or referrals.

                    ## 5. Budget, Pricing and Profitability

                    Explain the main startup and ongoing expenses.
                    Suggest a practical way to set prices and calculate profit.
                    Compare the approach with the user's stated budget.
                    Give cost figures only when useful, clearly labelling
                    them as illustrative estimates rather than quotations.
                    Never promise a particular profit or income.

                    ## 6. Location and Operations

                    Explain which type of location or operating model
                    could suit this business and its target customers.
                    Mention relevant factors such as rent, accessibility,
                    competition, suppliers, foot traffic, or delivery.
                    Suggest how to compare possible locations before committing.
                    If the location is unspecified, explain what to investigate.

                    ## 7. Risks and Growth Plan

                    Identify the most important risks for this business.
                    Give practical steps to reduce those risks.
                    Explain how to test the idea on a small scale first.
                    State what evidence would justify expanding the business.

                    STRICT REQUIREMENTS FOR ALL SEVEN SECTIONS:
                    - Include all seven numbered sections in the exact order.
                    - Never output a heading without its explanation.
                    - Give each section 2–4 concise bullet points or
                      approximately 3–5 short lines of useful information.
                    - Make every section specific to the user's answers.
                    - Do not repeat the same advice in multiple sections.
                    - Keep the language simple, practical, and beginner-friendly.
                    - Do not invent facts about the user's location or market.
                    - State when an answer is an estimate or needs research.

                    ## Final Recommendations

                    Give 3 prioritized actions the user should take next.
                    Explain what to do first, what to validate, and what
                    to avoid spending money on too early.

                    ## Best Alternative Ideas or Location

                    Recommend 1–2 alternatives suited to the user's answers.
                    These may be alternative business models, products,
                    services, or types of location.
                    For each alternative, explain why it may fit the budget
                    and target customers, and how to test it cheaply.
                    If a different location is suggested, describe the
                    type of area to investigate rather than claiming that
                    it is proven to be the best location.

                    ## Final Suggestion

                    End with a clear, personalized conclusion:
                    whether the user should proceed, modify the idea,
                    or validate the opportunity before investing.
                    Identify the single most useful next step.

                    IMPORTANT RULES:
                    - The initial report MUST contain all seven sections.
                    - Final Recommendations, Best Alternative Ideas or Location,
                      and Final Suggestion must appear AFTER section 7.
                    - Do not create an "Explore More Ideas" section.
                    - Do not repeat the seven sections at the end.
                    - Do not replace detailed answers with a list of headings.
                    - Do not guarantee demand, success, or profitability.
                    - Do not claim to have verified local market conditions.
                    - Keep the complete report concise but useful.

                    BUSINESS INFORMATION:
                    %s
                    """.formatted(businessDetails);
        }

        // 2. Detailed business report.
        if (normalizedTopic.equals("full report")
                || normalizedTopic.equals("full business report")) {

            return """
                    You are BizMate-AI, a practical and honest business advisor.

                    Create a detailed business report using the user's
                    actual questionnaire answers.

                    ## 1. Executive Summary
                    Explain the business, customer problem, possible
                    opportunity, assumptions, and overall recommendation.

                    ## 2. Target Customers
                    Describe customer groups, needs, buying behavior,
                    and ways to reach them.

                    ## 3. Market and Competition
                    Explain potential demand, available alternatives,
                    differentiation, and how to research competitors.
                    Do not invent verified market statistics.

                    ## 4. Estimated Startup Costs
                    Create a table with relevant estimated costs in INR.
                    Consider setup, equipment, inventory, rent or deposit,
                    marketing, applicable licences, and initial expenses.
                    Label unverified figures as illustrative estimates.
                    Compare the estimate with the user's available budget.

                    ## 5. Marketing and Sales Strategy
                    Explain affordable promotion, first-customer acquisition,
                    pricing considerations, and repeat sales.

                    ## 6. Risks and Solutions
                    Explain financial, demand, competition, supply,
                    and operational risks where relevant.
                    Provide practical ways to reduce each important risk.

                    ## 7. First 30-Day Action Plan
                    Divide the plan into Week 1, Week 2, Week 3, and Week 4.
                    Give practical tasks and expected outcomes.
                    Validate demand before major spending.

                    ## Final Recommendations
                    Provide three prioritized next steps.

                    ## Best Alternative Ideas or Location
                    Recommend one or two relevant alternatives and explain
                    why they may be worth testing.

                    ## Final Suggestion
                    State the most sensible next step for this user.

                    Use simple English and useful Markdown formatting.
                    Distinguish assumptions and estimates from verified facts.
                    Do not guarantee business success or profit.
                    Do not add a separate Explore More Ideas section.

                    BUSINESS INFORMATION:
                    %s
                    """.formatted(businessDetails);
        }

        // 3. Individual topic responses.
        String topicInstructions = switch (normalizedTopic) {

            case "target customers" ->
                    """
                    Explain the best potential customer groups, their needs,
                    buying behavior, and why they might choose this business.
                    Suggest practical ways to reach them and one low-cost
                    customer validation activity.
                    """;

            case "market & competition",
                 "market and competition",
                 "market and competition considerations" ->
                    """
                    Explain potential demand and possible direct or indirect
                    alternatives without inventing market research.
                    Suggest ways to differentiate through quality, price,
                    convenience, or service.
                    Give a local competitor research checklist and a simple
                    method to validate customer demand.
                    """;

            case "startup costs",
                 "estimated startup costs" ->
                    """
                    Prepare a practical startup-cost table in INR.
                    Consider relevant equipment, inventory, setup, rent or
                    deposit, marketing, applicable licences, and initial
                    operating expenses.
                    Label unverified figures as illustrative estimates.
                    Compare the costs with the user's budget.
                    Suggest a lower-cost starting option if necessary.
                    """;

            case "marketing strategy" ->
                    """
                    Create an affordable marketing strategy for the user's
                    specific business and target customers.
                    Include appropriate online and offline promotion,
                    first-customer acquisition, and repeat sales.
                    End with a practical first-week marketing plan.
                    """;

            case "risks & solutions",
                 "risks and solutions",
                 "risks and ways to reduce them" ->
                    """
                    Identify the most important risks for this business.
                    Explain why each risk matters and how to reduce it.
                    Consider budget, demand, competition, cash flow,
                    suppliers, and operations where relevant.
                    Prioritize the three risks to address before investing.
                    """;

            case "30-day action plan",
                 "first 30-day action plan" ->
                    """
                    Create a realistic plan divided into Week 1, Week 2,
                    Week 3, and Week 4.
                    Include research, customer validation, budget planning,
                    preparation, and a small test or launch if appropriate.
                    Give specific tasks and expected outcomes.
                    Avoid major spending before validating demand.
                    """;

            case "explore more ideas" ->
                    """
                    PURPOSE:
                    Help the user discover better or alternative business
                    ideas that fit their actual situation.

                    Generate FIVE distinct and realistic business ideas.
                    Consider the user's original idea, preferred location,
                    available budget, target customers, business type,
                    experience, goals, and intended business size.

                    For EACH idea, include:

                    ### Idea name
                    Give the idea a clear, understandable name.

                    **What it is:**
                    Explain the product or service and how it could work.

                    **Why it fits:**
                    Explain its potential suitability for the user's budget,
                    target customers, experience, and location.

                    **Suggested location:**
                    Recommend a suitable TYPE of area or operating model,
                    such as a residential area, college vicinity, market
                    area, home-based setup, or online operation, only
                    when appropriate for that idea.
                    Explain what the user should investigate locally.

                    **Illustrative starting budget:**
                    Provide a reasonable approximate range in INR when
                    sufficient information is available. State assumptions
                    and make clear that actual costs vary by location,
                    scale, rent, equipment, and licences.

                    **How to test it:**
                    Suggest one low-cost experiment to check whether
                    potential customers are interested before investing.

                    **Main challenge:**
                    Identify one significant risk or limitation.

                    ## Compare the Five Ideas

                    Briefly compare the ideas on budget fit, ease of testing,
                    customer fit, and main challenge.

                    ## Best Idea for This User

                    Select the strongest candidate to TEST FIRST based on
                    the information supplied. Explain why it appears to fit
                    better than the alternatives and give the first three
                    actions to take.

                    If important information is missing, state your
                    assumptions instead of pretending certainty.

                    IMPORTANT:
                    - Do not repeat the original seven-section report.
                    - Do not output the original seven analysis sections.
                    - Do not simply recommend the user's original idea again.
                    - Include five genuinely distinct alternatives.
                    - Do not invent verified local demand, rents, or statistics.
                    - Do not guarantee success or profit.
                    - Explain that location suitability must be validated
                      with local research and prospective customers.
                    """;

            default -> throw new IllegalArgumentException(
                    "Unsupported analysis topic: " + topic
                    + ". Please select a supported topic."
            );
        };

        return """
                You are BizMate-AI, a practical and honest business advisor.

                SELECTED TOPIC:
                %s

                Answer ONLY the selected topic.
                Personalize the response using the business idea, location,
                budget, target customers, experience, goal, and planned size
                included in the questionnaire answers.

                Use clear Markdown headings, short paragraphs, and
                practical bullet points.
                Follow every topic-specific instruction below.
                Do not replace the answer with generic advice.
                Label estimates and assumptions clearly.
                Do not invent verified market statistics.
                Never guarantee business success or profit.

                TOPIC-SPECIFIC INSTRUCTIONS:
                %s

                BUSINESS INFORMATION:
                %s
                """.formatted(
                topic,
                topicInstructions,
                businessDetails
        );
    }

    private String valueOrDefault(
            String value,
            String defaultValue) {

        return value == null || value.isBlank()
                ? defaultValue
                : value.trim();
    }
}
