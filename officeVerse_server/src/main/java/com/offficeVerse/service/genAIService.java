package com.offficeVerse.service;

import org.springframework.stereotype.Service;

@Service
public class genAIService {
    public String getResponse(String prompt) {
        // Call OpenAI API
        return "OpenAI response to: " + prompt;
    }
}
