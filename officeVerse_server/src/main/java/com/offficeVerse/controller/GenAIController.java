package com.offficeVerse.controller;

import com.offficeVerse.service.genAIService;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/genai")
@CrossOrigin(origins = "*")
public class GenAIController {
    
    private final genAIService genaiService;
    
    public GenAIController(genAIService genaiService) {
        this.genaiService = genaiService;
    }

    /**
     * Configure API key for GenAI service
     * POST /api/genai/configure
     * Request body: {
     *   "apiKey": "sk-...",
     *   "provider": "openai" (optional, default: openai)
     * }
     */
    @PostMapping("/configure")
    public Map<String, Object> configureAPI(@RequestBody Map<String, String> request) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            String apiKey = request.get("apiKey");
            String provider = request.getOrDefault("provider", "openai");
            
            if (apiKey == null || apiKey.trim().isEmpty()) {
                response.put("success", false);
                response.put("error", "API key cannot be empty");
                return response;
            }
            
            // Set the API key in the service
            genaiService.setApiKey(apiKey);
            genaiService.setProvider(provider);
            
            response.put("success", true);
            response.put("message", "API key configured successfully");
            response.put("provider", provider);
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("error", "Failed to configure API: " + e.getMessage());
        }
        
        return response;
    }
    
    /**
     * Validate API key
     * POST /api/genai/validate-key
     * Request body: {
     *   "apiKey": "sk-...",
     *   "provider": "openai"
     * }
     */
    @PostMapping("/validate-key")
    public Map<String, Object> validateAPIKey(@RequestBody Map<String, String> request) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            String apiKey = request.get("apiKey");
            String provider = request.getOrDefault("provider", "openai");
            
            if (apiKey == null || apiKey.trim().isEmpty()) {
                response.put("success", false);
                response.put("error", "API key cannot be empty");
                response.put("valid", false);
                return response;
            }
            
            // Validate the API key
            boolean isValid = genaiService.validateApiKey(apiKey, provider);
            
            response.put("success", true);
            response.put("valid", isValid);
            response.put("provider", provider);
            
            if (isValid) {
                response.put("message", "API key is valid!");
            } else {
                response.put("message", "API key validation failed");
            }
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("valid", false);
            response.put("error", "Validation error: " + e.getMessage());
        }
        
        return response;
    }
    
    /**
     * Check if API is configured
     * GET /api/genai/is-configured
     */
    @GetMapping("/is-configured")
    public Map<String, Object> isConfigured() {
        Map<String, Object> response = new HashMap<>();
        response.put("configured", genaiService.isConfigured());
        response.put("provider", genaiService.getProvider());
        return response;
    }

    /**
     * Query the GenAI service with a prompt
     * POST /api/genai/query
     * Request body: {
     *   "prompt": "user's question",
     *   "roomId": "room123",
     *   "timestamp": "ISO8601 timestamp"
     * }
     */
    @PostMapping("/query")
    public Map<String, Object> queryGenAI(@RequestBody Map<String, String> request) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            String prompt = request.get("prompt");
            String roomId = request.get("roomId");
            
            // Check if API is configured
            if (!genaiService.isConfigured()) {
                response.put("success", false);
                response.put("error", "GenAI service not configured. Please provide an API key.");
                response.put("requiresConfig", true);
                return response;
            }
            
            if (prompt == null || prompt.trim().isEmpty()) {
                response.put("success", false);
                response.put("error", "Prompt cannot be empty");
                return response;
            }
            
            if (prompt.length() > 500) {
                response.put("success", false);
                response.put("error", "Prompt too long (max 500 characters)");
                return response;
            }
            
            // Get response from GenAI service
            String aiResponse = genaiService.getResponse(prompt);
            
            response.put("success", true);
            response.put("response", aiResponse);
            response.put("roomId", roomId);
            response.put("timestamp", System.currentTimeMillis());
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("error", "Failed to process GenAI request: " + e.getMessage());
        }
        
        return response;
    }
    
    /**
     * Get GenAI service status
     * GET /api/genai/status
     */
    @GetMapping("/status")
    public Map<String, Object> getStatus() {
        Map<String, Object> status = genaiService.getStatus();
        status.put("endpoint", "OpenAI GPT-3.5 Turbo");
        status.put("ready", genaiService.isConfigured());
        return status;
    }
    
    /**
     * Health check endpoint
     * GET /api/genai/health
     */
    @GetMapping("/health")
    public Map<String, Object> health() {
        Map<String, Object> health = new HashMap<>();
        health.put("status", "UP");
        health.put("service", "GenAI");
        health.put("timestamp", System.currentTimeMillis());
        health.put("available", genaiService.isConfigured());
        return health;
    }
}
