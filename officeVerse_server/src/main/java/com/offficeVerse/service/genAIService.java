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
        
        // Build request body
        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("inputs", prompt);
        
        Map<String, Object> parameters = new HashMap<>();
        parameters.put("max_new_tokens", 512);
        parameters.put("temperature", 0.7);
        parameters.put("top_p", 0.9);
        requestBody.put("parameters", parameters);
        
        String jsonBody = objectMapper.writeValueAsString(requestBody);
        HttpEntity<String> entity = new HttpEntity<>(jsonBody, headers);
        
        // Make API call
        String response = restTemplate.postForObject(url, entity, String.class);
        
        // Parse response
        return parseHuggingFaceResponse(response);
    }
    
    /**
     * Parse Hugging Face API response
     */
    private String parseHuggingFaceResponse(String jsonResponse) throws Exception {
        JsonNode root = objectMapper.readTree(jsonResponse);
        
        // Handle array response
        if (root.isArray() && root.size() > 0) {
            JsonNode firstElement = root.get(0);
            if (firstElement.has("generated_text")) {
                String generatedText = firstElement.get("generated_text").asText();
                return generatedText.trim();
            }
        }
        
        // Handle direct response object
        if (root.has("generated_text")) {
            return root.get("generated_text").asText().trim();
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
