package com.offficeVerse.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Service
public class genAIService {

    // Runtime API key (can be set dynamically)
    private String runtimeApiKey;
    
    // Provider (openai, huggingface, etc.)
    private String provider = "openai";

    @Value("${genai.huggingface.api-key:}")
    private String huggingFaceApiKey;

    @Value("${genai.huggingface.model:mistralai/Mistral-7B-Instruct}")
    private String modelName;

    // Note: Hugging Face free inference API (api-inference.huggingface.co) has been deprecated
    // For production, users should either:
    // 1. Use Hugging Face Paid Inference Endpoints
    // 2. Deploy their own inference server
    // 3. Use alternative AI APIs (OpenAI, Anthropic, etc.)
    // This is a fallback endpoint - may need updating based on current HF offerings
    private static final String HF_INFERENCE_ENDPOINT = "https://api-inference.huggingface.co/models/";
    
    // OpenAI API endpoint
    private static final String OPENAI_ENDPOINT = "https://api.openai.com/v1/chat/completions";

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * Set API key at runtime
     */
    public void setApiKey(String apiKey) {
        this.runtimeApiKey = apiKey;
    }

    /**
     * Get current API key
     */
    public String getApiKey() {
        // Priority: runtime API key > config API key
        if (runtimeApiKey != null && !runtimeApiKey.isEmpty()) {
            return runtimeApiKey;
        }
        return huggingFaceApiKey;
    }

    /**
     * Set provider
     */
    public void setProvider(String provider) {
        this.provider = provider != null ? provider.toLowerCase() : "openai";
    }

    /**
     * Get current provider
     */
    public String getProvider() {
        return provider;
    }

    /**
     * Main method to get AI response for a prompt
     */
    public String getResponse(String prompt) {
        try {
            String apiKey = getApiKey();
            if (apiKey == null || apiKey.isEmpty()) {
                throw new RuntimeException("No API key configured. Please configure an API key first.");
            }
            
            if ("openai".equalsIgnoreCase(provider)) {
                return queryOpenAI(prompt, apiKey);
            } else {
                return queryMistral(prompt, apiKey);
            }
        } catch (Exception e) {
            return "Error: " + e.getMessage();
        }
    }

    /**
     * Query OpenAI API
     */
    private String queryOpenAI(String prompt, String apiKey) throws Exception {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("Authorization", "Bearer " + apiKey);

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("model", "gpt-3.5-turbo");
        requestBody.put("messages", new Object[]{
            Map.of("role", "user", "content", prompt)
        });
        requestBody.put("temperature", 0.7);
        requestBody.put("max_tokens", 500);

        String jsonBody = objectMapper.writeValueAsString(requestBody);
        HttpEntity<String> entity = new HttpEntity<>(jsonBody, headers);

        try {
            String response = restTemplate.postForObject(OPENAI_ENDPOINT, entity, String.class);
            return parseOpenAIResponse(response);
        } catch (org.springframework.web.client.HttpClientErrorException e) {
            int status = e.getStatusCode().value();
            
            if (status == 401) {
                throw new Exception("Invalid OpenAI API key");
            } else if (status == 429) {
                throw new Exception("Rate limit exceeded. Please try again later.");
            }
            
            String errorMsg = "OpenAI API Error: " + e.getStatusCode() + " - " + e.getResponseBodyAsString();
            System.err.println(errorMsg);
            throw new Exception(errorMsg);
        }
    }

    /**
     * Parse OpenAI response
     */
    private String parseOpenAIResponse(String jsonResponse) throws Exception {
        JsonNode root = objectMapper.readTree(jsonResponse);

        if (root.has("choices") && root.get("choices").isArray() && root.get("choices").size() > 0) {
            JsonNode firstChoice = root.get("choices").get(0);
            if (firstChoice.has("message") && firstChoice.get("message").has("content")) {
                return firstChoice.get("message").get("content").asText().trim();
            }
        }

        if (root.has("error")) {
            throw new Exception(root.get("error").get("message").asText());
        }

        return "No response generated from OpenAI";
    }

    /**
     * Query Mistral-7B-Instruct model via Hugging Face API
     * Note: The free Inference API endpoint may be deprecated
     * For production use, consider using paid endpoints or alternative services
     */
    private String queryMistral(String prompt, String apiKey) throws Exception {
        String url = HF_INFERENCE_ENDPOINT + modelName;

        // Build request headers
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("Authorization", "Bearer " + apiKey);

        // Build request body - simple format for text generation
        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("inputs", prompt);

        String jsonBody = objectMapper.writeValueAsString(requestBody);
        HttpEntity<String> entity = new HttpEntity<>(jsonBody, headers);

        // Call Hugging Face API
        try {
            String response = restTemplate.postForObject(url, entity, String.class);
            return parseHuggingFaceResponse(response);
        } catch (org.springframework.web.client.HttpClientErrorException e) {
            // Handle specific error cases
            int status = e.getStatusCode().value();
            
            if (status == 410) {
                String message = "Hugging Face free inference API has been deprecated. " +
                    "Please use a paid inference endpoint or alternative AI service.";
                System.err.println(message);
                throw new Exception(message);
            }
            
            // Provide more detailed error information
            String errorMsg = "Hugging Face API Error: " + e.getStatusCode() + " - " + e.getResponseBodyAsString();
            System.err.println(errorMsg);
            throw new Exception(errorMsg);
        }
    }

    /**
     * Parse Hugging Face Serverless Inference API response
     * Handles both array and object response formats
     */
    private String parseHuggingFaceResponse(String jsonResponse) throws Exception {
        JsonNode root = objectMapper.readTree(jsonResponse);

        if (root.isArray() && root.size() > 0) {
            JsonNode firstElement = root.get(0);
            if (firstElement.has("generated_text")) {
                return firstElement.get("generated_text").asText().trim();
            }
        }

        if (root.has("generated_text")) {
            return root.get("generated_text").asText().trim();
        }

        return "No response generated from AI model";
    }

    /**
     * Validate API key without using it for generation
     */
    public boolean validateApiKey(String apiKey, String provider) {
        try {
            if (apiKey == null || apiKey.isEmpty()) {
                return false;
            }

            if ("openai".equalsIgnoreCase(provider)) {
                return validateOpenAIKey(apiKey);
            } else {
                return validateHuggingFaceKey(apiKey);
            }
        } catch (Exception e) {
            System.err.println("API key validation error: " + e.getMessage());
            return false;
        }
    }

    /**
     * Validate OpenAI API key
     */
    private boolean validateOpenAIKey(String apiKey) throws Exception {
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + apiKey);

        HttpEntity<String> entity = new HttpEntity<>(headers);

        try {
            // Call a simple OpenAI endpoint to validate
            String response = restTemplate.exchange(
                "https://api.openai.com/v1/models", 
                org.springframework.http.HttpMethod.GET,
                entity,
                String.class
            ).getBody();
            
            return response != null && !response.isEmpty();
        } catch (org.springframework.web.client.HttpClientErrorException e) {
            if (e.getStatusCode().value() == 401) {
                return false; // Invalid key
            }
            // Other errors might still mean the API is accessible but we're having network issues
            return false;
        }
    }

    /**
     * Validate Hugging Face API key
     */
    private boolean validateHuggingFaceKey(String apiKey) throws Exception {
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + apiKey);

        HttpEntity<String> entity = new HttpEntity<>(headers);

        try {
            String response = restTemplate.exchange(
                "https://api-inference.huggingface.co/models/" + modelName,
                org.springframework.http.HttpMethod.GET,
                entity,
                String.class
            ).getBody();
            
            return response != null && !response.isEmpty();
        } catch (org.springframework.web.client.HttpClientErrorException e) {
            if (e.getStatusCode().value() == 401) {
                return false; // Invalid key
            }
            return false; // Other errors also mean validation failed
        }
    }

    /**
     * Check if GenAI service is properly configured
     */
    public boolean isConfigured() {
        String apiKey = getApiKey();
        return apiKey != null && !apiKey.isEmpty();
    }

    /**
     * Get service status information
     */
    public Map<String, Object> getStatus() {
        Map<String, Object> status = new HashMap<>();
        status.put("available", isConfigured());
        status.put("model", modelName);
        status.put("provider", provider);
        status.put("configured", isConfigured());
        
        if ("openai".equalsIgnoreCase(provider)) {
            status.put("model", "gpt-3.5-turbo");
        }
        
        return status;
    }
}
