package com.offficeVerse.util;

import java.util.concurrent.ConcurrentHashMap;


public class SessionManager {
    private static final ConcurrentHashMap<String, String> sessions = new ConcurrentHashMap<>();


    public static void add(String sessionId, String user) {
        sessions.put(sessionId, user);
    }
}
