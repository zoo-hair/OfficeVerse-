package com.offficeVerse.service;

import org.springframework.stereotype.Service;

@Service
public class DiscordService {

    public String sendMessageToDiscord(String message) {
        // Call Discord API here (HTTP request)
        return "Sent to Discord: " + message;
    }

    public String fetchMessages() {
        // Fetch messages from Discord API
        return "Discord messages";
    }

    // still under construction

}

