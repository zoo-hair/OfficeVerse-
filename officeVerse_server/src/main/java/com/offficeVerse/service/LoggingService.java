package com.offficeVerse.service;

import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;


@Service
public class LoggingService {


    @Async
    public void log(String message) {
        System.out.println("[LOG]: " + message);
    }
}
