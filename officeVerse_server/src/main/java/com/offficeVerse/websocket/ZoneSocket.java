package com.offficeVerse.websocket;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.offficeVerse.model.Player;
import com.offficeVerse.service.PlayerService;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.*;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class ZoneSocket extends TextWebSocketHandler {

    private final PlayerService playerService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    // Map: roomId -> set of sessions
    private final Map<Long, Set<WebSocketSession>> roomSessions = new ConcurrentHashMap<>();

    // Map: sessionId -> player info
    private final Map<String, ZonePlayerInfo> sessionPlayerMap = new ConcurrentHashMap<>();

    public ZoneSocket(PlayerService playerService) {
        this.playerService = playerService;
    }

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        System.out.println("Zone WebSocket connected: " + session.getId());
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        try {
            Map<String, Object> payload = objectMapper.readValue(message.getPayload(), Map.class);
            String type = (String) payload.get("type");
            Map<String, Object> data = (Map<String, Object>) payload.get("data");

            switch (type) {
                case "join":
                    handleJoin(session, data);
                    break;
                case "enterZone":
                    handleEnterZone(session, data);
                    break;
              /*  case "exitZone":
                    handleExitZone(session, data);
                    break;
                case "zoneInteraction":
                    handleZoneInteraction(session, data);
                    break;
                case "requestMeeting":
                    handleRequestMeeting(session, data);
                    break;
                case "aiPrompt":
                    handleAIPrompt(session, data);
                    break; */
                default:
                    System.out.println("Unknown zone message type: " + type);
            }
        } catch (Exception e) {
            System.err.println("Error handling zone message: " + e.getMessage());
            e.printStackTrace();
        }
    }

    private void handleJoin(WebSocketSession session, Map<String, Object> data) throws Exception {
        Long playerId = Long.parseLong(data.get("playerId").toString());
        Long roomId = Long.parseLong(data.get("roomId").toString());

        Player player = playerService.getPlayer(playerId);
        if (player == null) {
            session.sendMessage(new TextMessage("{\"error\":\"Player not found\"}"));
            return;
        }

        // Store session info
        ZonePlayerInfo info = new ZonePlayerInfo(playerId, player.getName(), roomId);
        sessionPlayerMap.put(session.getId(), info);

        // Add to room
        roomSessions.computeIfAbsent(roomId, k -> ConcurrentHashMap.newKeySet()).add(session);

        System.out.println("Player " + player.getName() + " connected to zones");
    }

    private void handleEnterZone(WebSocketSession session, Map<String, Object> data) throws Exception {
        ZonePlayerInfo info = sessionPlayerMap.get(session.getId());
        if (info == null) {
            return;
        }

        String zoneId = (String) data.get("zoneId");
        String prompt = (String) data.get("prompt");

        System.out.println("AI prompt in zone " + zoneId + ": " + prompt);

        // Here you would typically call your AI service
        // For now, just log it
    }

    private void broadcastToRoom(Long roomId, String message, String excludeSessionId) {
        Set<WebSocketSession> sessions = roomSessions.get(roomId);
        if (sessions != null) {
            for (WebSocketSession s : sessions) {
                if (s.isOpen() && !s.getId().equals(excludeSessionId)) {
                    try {
                        s.sendMessage(new TextMessage(message));
                    } catch (Exception e) {
                        System.err.println("Error broadcasting to room: " + e.getMessage());
                    }
                }
            }
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
        System.out.println("Zone WebSocket disconnected: " + session.getId());

        ZonePlayerInfo info = sessionPlayerMap.remove(session.getId());
        if (info != null) {
            Set<WebSocketSession> sessions = roomSessions.get(info.roomId);
            if (sessions != null) {
                sessions.remove(session);
                if (sessions.isEmpty()) {
                    roomSessions.remove(info.roomId);
                }
            }
        }
    }

    private static class ZonePlayerInfo {
        Long playerId;
        String playerName;
        Long roomId;

        ZonePlayerInfo(Long playerId, String playerName, Long roomId) {
            this.playerId = playerId;
            this.playerName = playerName;
            this.roomId = roomId;
        }
    }
}