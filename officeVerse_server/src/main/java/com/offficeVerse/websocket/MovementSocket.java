package com.offficeVerse.websocket;

import org.springframework.stereotype.Component;
import org.springframework.web.socket.*;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class MovementSocket extends TextWebSocketHandler {

    // Track sessions by Room ID: Map<RoomID, Map<SessionID, WebSocketSession>>
    private final Map<Long, Map<String, WebSocketSession>> roomSessions = new ConcurrentHashMap<>();

    // Track player info per session: Map<SessionID, PlayerInfo>
    private final Map<String, PlayerSessionInfo> sessionInfo = new ConcurrentHashMap<>();

    private static class PlayerSessionInfo {
        Long playerId;
        Long roomId;

        PlayerSessionInfo(Long playerId, Long roomId) {
            this.playerId = playerId;
            this.roomId = roomId;
        }
    }

    public MovementSocket() {
    }

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        System.out.println("Movement WebSocket connected: " + session.getId());
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {

        String[] parts = message.getPayload().split(":");
        // Format: roomId:playerId:x:y:name:skin:anim:flip
        if (parts.length < 4 || parts.length > 8) {
            session.sendMessage(new TextMessage("Invalid format. Use roomId:playerId:x:y[:name][:skin][:anim][:flip]"));
            return;
        }

        try {
            Long roomId = Long.parseLong(parts[0]);
            Long playerId = Long.parseLong(parts[1]);
            int x = Integer.parseInt(parts[2]);
            int y = Integer.parseInt(parts[3]);
            String name = (parts.length >= 5) ? parts[4] : "Unknown";
            String skin = (parts.length >= 6) ? parts[5] : "0xffffff";
            String anim = (parts.length >= 7) ? parts[6] : "idle";
            String flip = (parts.length == 8) ? parts[7] : "0";

            // Register session in room if not already
            if (!sessionInfo.containsKey(session.getId())) {
                sessionInfo.put(session.getId(), new PlayerSessionInfo(playerId, roomId));
                roomSessions.computeIfAbsent(roomId, k -> new ConcurrentHashMap<>()).put(session.getId(), session);
            }

            // Broadcast only to players in the same room
            Map<String, WebSocketSession> peers = roomSessions.get(roomId);
            if (peers != null) {
                TextMessage broadcastMsg = new TextMessage("Broadcast:" + playerId + ":" + x + ":" + y + ":" + name
                        + ":" + skin + ":" + anim + ":" + flip);
                for (WebSocketSession s : peers.values()) {
                    if (s.isOpen()) {
                        try {
                            s.sendMessage(broadcastMsg);
                        } catch (Exception e) {
                            System.out.println("Error broadcasting movement: " + e.getMessage());
                        }
                    }
                }
            }

        } catch (NumberFormatException e) {
            System.out.println("Error parsing numbers: " + e.getMessage());
            session.sendMessage(new TextMessage("Invalid numbers"));
        } catch (Exception e) {
            System.out.println("Error in handleTextMessage: " + e.getMessage());
            e.printStackTrace();
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
        System.out.println("Movement WebSocket disconnected: " + session.getId());

        PlayerSessionInfo info = sessionInfo.remove(session.getId());
        if (info != null) {
            Map<String, WebSocketSession> peers = roomSessions.get(info.roomId);
            if (peers != null) {
                peers.remove(session.getId());
                if (peers.isEmpty()) {
                    roomSessions.remove(info.roomId);
                } else {
                    // Notify others in room
                    TextMessage leftMsg = new TextMessage("PlayerLeft:" + info.playerId);
                    for (WebSocketSession s : peers.values()) {
                        if (s.isOpen()) {
                            s.sendMessage(leftMsg);
                        }
                    }
                }
            }
        }
    }
}
