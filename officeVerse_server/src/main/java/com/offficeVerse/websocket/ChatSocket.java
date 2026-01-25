package com.offficeVerse.websocket;

import org.springframework.stereotype.Component;
import org.springframework.web.socket.*;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.io.IOException;

@Component
public class ChatSocket extends TextWebSocketHandler {

    // Track sessions by Room ID: Map<RoomID, Map<PlayerID, WebSocketSession>>
    private final Map<Long, Map<Long, WebSocketSession>> roomSessions = new ConcurrentHashMap<>();
    // Track player names by Room ID: Map<RoomID, Map<PlayerID, Name>>
    private final Map<Long, Map<Long, String>> roomPlayerNames = new ConcurrentHashMap<>();

    // Track meeting participants: Map<RoomID, Set<PlayerID>>
    private final Map<Long, Set<Long>> meetingParticipants = new ConcurrentHashMap<>();

    // Map sessionId -> session info for disconnect handling
    private final Map<String, PlayerSessionInfo> sessionInfo = new ConcurrentHashMap<>();

    private static class PlayerSessionInfo {
        Long playerId;
        Long roomId;

        PlayerSessionInfo(Long playerId, Long roomId) {
            this.playerId = playerId;
            this.roomId = roomId;
        }
    }

    public ChatSocket() {
    }

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        System.out.println("Chat WebSocket connected: " + session.getId());
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        String payload = message.getPayload();
        String[] parts = payload.split(":", 5); // expect up to 5 parts

        if (payload.startsWith("REGISTER:")) {
            // REGISTER:RoomID:PlayerID:PlayerName
            if (parts.length >= 4) {
                Long roomId = Long.parseLong(parts[1]);
                Long playerId = Long.parseLong(parts[2]);
                String playerName = parts[3];

                sessionInfo.put(session.getId(), new PlayerSessionInfo(playerId, roomId));
                roomSessions.computeIfAbsent(roomId, k -> new ConcurrentHashMap<>()).put(playerId, session);
                roomPlayerNames.computeIfAbsent(roomId, k -> new ConcurrentHashMap<>()).put(playerId, playerName);

                System.out.println("Registered Chat: Room " + roomId + ", Player " + playerName);
                broadcastToRoom(roomId, "GLOBAL:System:" + playerName + " joined the game.");
                broadcastPlayerList(roomId);
            }
        } else if (payload.startsWith("GLOBAL:")) {
            // GLOBAL:SenderID:Msg
            if (parts.length >= 3) {
                PlayerSessionInfo info = sessionInfo.get(session.getId());
                if (info != null) {
                    String senderId = parts[1];
                    String text = parts[2];
                    broadcastToRoom(info.roomId, "GLOBAL:" + senderId + ":" + text);
                }
            }
        } else if (payload.startsWith("PRIVATE:")) {
            // PRIVATE:SenderID:TargetID:Msg
            if (parts.length >= 4) {
                PlayerSessionInfo info = sessionInfo.get(session.getId());
                if (info != null) {
                    String senderId = parts[1];
                    Long targetId = Long.parseLong(parts[2]);
                    String text = parts[3];

                    WebSocketSession targetSession = roomSessions.get(info.roomId).get(targetId);
                    if (targetSession != null && targetSession.isOpen()) {
                        targetSession.sendMessage(new TextMessage("PRIVATE:" + senderId + ":" + text));
                        session.sendMessage(new TextMessage("PRIVATE:To " + targetId + ":" + text));
                    } else {
                        session.sendMessage(
                                new TextMessage("SYSTEM:Player " + targetId + " not found in this office."));
                    }
                }
            }
        } else if (payload.startsWith("VOICE_SIGNAL:")) {
            // VOICE_SIGNAL:SenderID:TargetID:JsonPayload
            // Relays WebRTC signaling data (Offer, Answer, ICE Candidates)
            if (parts.length >= 4) {
                PlayerSessionInfo info = sessionInfo.get(session.getId());
                if (info != null) {
                    String senderId = parts[1];
                    Long targetId = Long.parseLong(parts[2]);

                    int thirdColonIndex = -1;
                    int colonsFound = 0;
                    for (int i = 0; i < payload.length(); i++) {
                        if (payload.charAt(i) == ':') {
                            colonsFound++;
                            if (colonsFound == 3) {
                                thirdColonIndex = i;
                                break;
                            }
                        }
                    }

                    if (thirdColonIndex != -1) {
                        String signalPayload = payload.substring(thirdColonIndex + 1);

                        WebSocketSession targetSession = roomSessions.get(info.roomId).get(targetId);
                        if (targetSession != null && targetSession.isOpen()) {
                            // Forward to target: VOICE_SIGNAL:SenderID:Payload
                            targetSession
                                    .sendMessage(new TextMessage("VOICE_SIGNAL:" + senderId + ":" + signalPayload));
                        }
                    }
                }
            }
        } else if (payload.startsWith("MEETING_JOIN:")) {
            if (parts.length >= 3) {
                PlayerSessionInfo info = sessionInfo.get(session.getId());
                if (info != null) {
                    meetingParticipants.computeIfAbsent(info.roomId, k -> ConcurrentHashMap.newKeySet())
                            .add(info.playerId);
                    broadcastToMeeting(info.roomId, "MEETING_USER_JOINED:" + info.playerId);

                    Set<Long> participants = meetingParticipants.get(info.roomId);
                    String current = "";
                    if (participants != null) {
                        current = String.join(",",
                                participants.stream()
                                        .filter(id -> !id.equals(info.playerId))
                                        .map(Object::toString)
                                        .toArray(String[]::new));
                    }
                    session.sendMessage(new TextMessage("MEETING_LIST:" + current));
                }
            }
        } else if (payload.startsWith("MEETING_LEAVE:")) {
            PlayerSessionInfo info = sessionInfo.get(session.getId());
            if (info != null) {
                Set<Long> participants = meetingParticipants.get(info.roomId);
                if (participants != null) {
                    participants.remove(info.playerId);
                    broadcastToMeeting(info.roomId, "MEETING_USER_LEFT:" + info.playerId);
                }
            }
        }
    }

    private void broadcastPlayerList(Long roomId) {
        try {
            Map<Long, String> names = roomPlayerNames.get(roomId);
            if (names != null) {
                List<String> listItems = new ArrayList<>();
                for (Map.Entry<Long, String> entry : names.entrySet()) {
                    listItems.add(entry.getKey().toString());
                    listItems.add(entry.getValue());
                }
                String result = String.join(",", listItems);
                broadcastToRoom(roomId, "PLAYER_LIST:" + result);
            }
        } catch (Exception e) {
            System.out.println("Error broadcasting player list: " + e.getMessage());
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
        System.out.println("Chat WebSocket disconnected: " + session.getId());

        PlayerSessionInfo info = sessionInfo.remove(session.getId());
        if (info != null) {
            // Remove from meeting if present
            Set<Long> participants = meetingParticipants.get(info.roomId);
            if (participants != null && participants.remove(info.playerId)) {
                broadcastToMeeting(info.roomId, "MEETING_USER_LEFT:" + info.playerId);
            }

            Map<Long, WebSocketSession> peers = roomSessions.get(info.roomId);
            Map<Long, String> names = roomPlayerNames.get(info.roomId);

            if (peers != null) {
                String leaverName = names.getOrDefault(info.playerId, "Unknown");
                peers.remove(info.playerId);
                names.remove(info.playerId);

                broadcastToRoom(info.roomId, "GLOBAL:System:" + leaverName + " left the game.");
                broadcastPlayerList(info.roomId);

                if (peers.isEmpty()) {
                    roomSessions.remove(info.roomId);
                    roomPlayerNames.remove(info.roomId);
                    meetingParticipants.remove(info.roomId);
                }
            }
        }
    }

    private void broadcastToRoom(Long roomId, String message) {
        Map<Long, WebSocketSession> peers = roomSessions.get(roomId);
        if (peers != null) {
            TextMessage textMsg = new TextMessage(message);
            for (WebSocketSession s : peers.values()) {
                if (s.isOpen()) {
                    try {
                        s.sendMessage(textMsg);
                    } catch (IOException e) {
                        System.out.println("Error sending chat: " + e.getMessage());
                    }
                }
            }
        }
    }

    private void broadcastToMeeting(Long roomId, String message) throws IOException {
        Set<Long> participants = meetingParticipants.get(roomId);
        Map<Long, WebSocketSession> sessions = roomSessions.get(roomId);
        if (participants != null && sessions != null) {
            TextMessage msg = new TextMessage(message);
            for (Long pid : participants) {
                WebSocketSession s = sessions.get(pid);
                if (s != null && s.isOpen()) {
                    s.sendMessage(msg);
                }
            }
        }
    }
}
