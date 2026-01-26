package com.offficeVerse.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import java.util.HashMap;
import java.util.Map;
import java.util.ArrayList;
import java.util.List;

@Service
public class genAIService {
    
    @Value("${genai.huggingface.api-key:}")
    private String huggingFaceApiKey;
    
    @Value("${genai.huggingface.model:mistralai/Mistral-7B-Instruct}")
    private String modelName;
    
    private static final String HF_ENDPOINT = "https://api-inference.huggingface.co/models/";
    private static final String HF_ROUTER_ENDPOINT = "https://api-inference.huggingface.co/models/";
    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();
    
    public String getResponse(String prompt) {
        try {
            if (huggingFaceApiKey == null || huggingFaceApiKey.isEmpty()) {
                throw new RuntimeException("Hugging Face API key not configured. Set 'genai.huggingface.api-key' in application properties.");
            }
            
            return queryMistral(prompt);
        } catch (Exception e) {
            return "Error: " + e.getMessage();
        }
    }
    
    /**
     * Query Mistral-7B-Instruct model via Hugging Face API
     */
    private String queryMistral(String prompt) throws Exception {
        String url = HF_ENDPOINT + modelName;
        
        // Build request headers
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("Authorization", "Bearer " + huggingFaceApiKey);
        
        // Build request body using the chat format
        Map<String, Object> requestBody = new HashMap<>();
        
        // Use messages format for better compatibility
        List<Map<String, String>> messages = new ArrayList<>();
        Map<String, String> userMessage = new HashMap<>();
        userMessage.put("role", "user");
        userMessage.put("content", prompt);
        messages.add(userMessage);
        
        requestBody.put("messages", messages);
        
        Map<String, Object> parameters = new HashMap<>();
        parameters.put("max_new_tokens", 512);
        parameters.put("temperature", 0.7);
        parameters.put("top_p", 0.9);
        requestBody.put("parameters", parameters);
        
        String jsonBody = objectMapper.writeValueAsString(requestBody);
        HttpEntity<String> entity = new HttpEntity<>(jsonBody, headers);
        
        try {
            // Make API call
            String response = restTemplate.postForObject(url, entity, String.class);
            
            // Parse response
            return parseHuggingFaceResponse(response);
        } catch (Exception e) {
            // Fallback to simple inputs format if messages format fails
            requestBody.clear();
            requestBody.put("inputs", prompt);
            requestBody.put("parameters", parameters);
            
            jsonBody = objectMapper.writeValueAsString(requestBody);
            entity = new HttpEntity<>(jsonBody, headers);
            
            String response = restTemplate.postForObject(url, entity, String.class);
            return parseHuggingFaceResponse(response);
        }
    }
    
    /**
     * Parse Hugging Face API response
     */
    private String parseHuggingFaceResponse(String jsonResponse) throws Exception {
        JsonNode root = objectMapper.readTree(jsonResponse);
        
        // Handle array response (traditional format)
        if (root.isArray() && root.size() > 0) {
            JsonNode firstElement = root.get(0);
            if (firstElement.has("generated_text")) {
                String generatedText = firstElement.get("generated_text").asText();
                return generatedText.trim();
            }
        }
        
        // Handle direct response object with generated_text
        if (root.has("generated_text")) {
            return root.get("generated_text").asText().trim();
        }
        
        // Handle chat format response
        if (root.isArray() && root.size() > 0) {
            JsonNode firstElement = root.get(0);
            // For message format responses
            if (firstElement.has("content")) {
                return firstElement.get("content").asText().trim();
            }
            // For generated_text format
            if (firstElement.has("generated_text")) {
                String text = firstElement.get("generated_text").asText();
                // Extract just the response part if it includes the prompt
                if (text.contains("[/INST]")) {
                    text = text.split("\\[/INST\\]")[1].trim();
                }
                return text.trim();
            }
        }
        
        return "No response generated from AI model";
    }
    
    /**
     * Check if GenAI service is properly configured
     */
    public boolean isConfigured() {
        return huggingFaceApiKey != null && !huggingFaceApiKey.isEmpty();
    }
    
    /**
     * Get service status information
     */
    public Map<String, Object> getStatus() {
        Map<String, Object> status = new HashMap<>();
        status.put("available", isConfigured());
        status.put("model", modelName);
        status.put("provider", "Hugging Face Inference API");
        status.put("configuredKey", isConfigured());
        return status;
    }
}
