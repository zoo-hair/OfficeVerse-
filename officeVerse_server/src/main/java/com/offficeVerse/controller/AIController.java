package com.offficeVerse.controller;

import com.offficeVerse.service.AIService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/ai")
@CrossOrigin(origins = "*")
public class AIController {


    private final AIService aiService;


    public AIController(AIService aiService) {
        this.aiService = aiService;
    }


    @GetMapping("/move")
    public String aiMove() {
        return aiService.generateMove();
    }
}