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
        status.put("endpoint", "Mistral-7B-Instruct");
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
