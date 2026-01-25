package com.offficeVerse.websocket;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.offficeVerse.model.Room;
import com.offficeVerse.model.Player;
import com.offficeVerse.service.RoomService;
import com.offficeVerse.service.PlayerService;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.*;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class RoomSocket extends TextWebSocketHandler {

    private final RoomService roomService;
    private final PlayerService playerService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    // All connected sessions (for broadcasting room list updates)
    private final Set<WebSocketSession> allSessions = ConcurrentHashMap.newKeySet();

    // Map: roomId -> set of sessions in that room
    private final Map<Long, Set<WebSocketSession>> roomSessions = new ConcurrentHashMap<>();

    // Map: sessionId -> current roomId (if in a room)
    private final Map<String, Long> sessionRoomMap = new ConcurrentHashMap<>();

    // Map: sessionId -> playerId
    private final Map<String, Long> sessionPlayerMap = new ConcurrentHashMap<>();

    public RoomSocket(RoomService roomService, PlayerService playerService) {
        this.roomService = roomService;
        this.playerService = playerService;
    }

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        System.out.println("Room WebSocket connected: " + session.getId());
        allSessions.add(session);
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        try {
            Map<String, Object> payload = objectMapper.readValue(message.getPayload(), Map.class);
            String type = (String) payload.get("type");
            Map<String, Object> data = (Map<String, Object>) payload.getOrDefault("data", new HashMap<>());

            switch (type) {
                case "join":
                    handleJoin(session, data);
                    break;
                case "subscribeRoomList":
                    handleSubscribeRoomList(session);
                    break;
                case "createRoom":
                    handleCreateRoom(session, data);
                    break;
                case "joinRoom":
                    handleJoinRoom(session, data);
                    break;
                case "joinRoomByCode":
                    handleJoinRoomByCode(session, data);
                    break;
                case "leaveRoom":
                    handleLeaveRoom(session, data);
                    break;
                case "setReady":
                    handleSetReady(session, data);
                    break;
                case "startGame":
                    handleStartGame(session, data);
                    break;
                case "ping":
                    handlePing(session);
                    break;
                default:
                    System.out.println("Unknown room message type: " + type);
            }
        } catch (Exception e) {
            System.err.println("Error handling room message: " + e.getMessage());
            e.printStackTrace();
        }
    }

    private void handleJoin(WebSocketSession session, Map<String, Object> data) throws Exception {
        String playerName = data.containsKey("playerName") ? data.get("playerName").toString() : "Anonymous";

        // Create player in database to get a valid ID
        Player player = playerService.createPlayer(playerName, null);
        Long playerId = player.getId();

        sessionPlayerMap.put(session.getId(), playerId);
        System.out.println("Player " + playerName + " (ID: " + playerId + ") connected to room socket");

        // Send back the confirmed playerId to the client
        Map<String, Object> response = new HashMap<>();
        response.put("type", "registered");
        Map<String, Object> responseData = new HashMap<>();
        responseData.put("playerId", playerId);
        response.put("data", responseData);
        session.sendMessage(new TextMessage(objectMapper.writeValueAsString(response)));
    }

    private void handleSubscribeRoomList(WebSocketSession session) throws Exception {
        // Send current room list to this session
        List<Room> rooms = roomService.getAllRooms();

        Map<String, Object> response = new HashMap<>();
        response.put("type", "roomListUpdated");
        response.put("data", convertRoomsToList(rooms));

        session.sendMessage(new TextMessage(objectMapper.writeValueAsString(response)));
    }

    private void handleCreateRoom(WebSocketSession session, Map<String, Object> data) throws Exception {
        String roomName = (String) data.get("roomName");
        int maxPlayers = data.containsKey("maxPlayers") ? (int) data.get("maxPlayers") : 20;
        boolean isPrivate = data.containsKey("isPrivate") ? (boolean) data.get("isPrivate") : false;

        Long playerId = sessionPlayerMap.get(session.getId());

        // Create room (you'll need to implement this in RoomService)
        Room room = roomService.createRoom(roomName, maxPlayers, isPrivate, playerId);

        // Broadcast new room to all subscribers
        Map<String, Object> broadcast = new HashMap<>();
        broadcast.put("type", "roomCreated");
        Map<String, Object> roomData = new HashMap<>();
        roomData.put("room", convertRoomToMap(room));
        broadcast.put("data", roomData);

        broadcastToAll(objectMapper.writeValueAsString(broadcast));

        System.out.println("Room created: " + roomName);
    }

    private void handleJoinRoom(WebSocketSession session, Map<String, Object> data) throws Exception {
        Long roomId = Long.parseLong(data.get("roomId").toString());
        Long playerId = sessionPlayerMap.get(session.getId());

        Room room = roomService.getRoom(roomId);
        if (room == null) {
            sendError(session, "Room not found");
            return;
        }

        // Add player to room
        // You'll need to implement addPlayerToRoom in RoomService
        boolean success = roomService.addPlayerToRoom(roomId, playerId, playerService);

        if (!success) {
            sendError(session, "Failed to join room (might be full)");
            return;
        }

        // Track session in room
        roomSessions.computeIfAbsent(roomId, k -> ConcurrentHashMap.newKeySet()).add(session);
        sessionRoomMap.put(session.getId(), roomId);

        // Send success to player
        Map<String, Object> response = new HashMap<>();
        response.put("type", "joinedRoom");
        Map<String, Object> responseData = new HashMap<>();
        responseData.put("room", convertRoomToMap(room));
        responseData.put("players", roomService.getPlayersInRoom(roomId));
        response.put("data", responseData);
        session.sendMessage(new TextMessage(objectMapper.writeValueAsString(response)));

        // Notify others in room
        Map<String, Object> broadcast = new HashMap<>();
        broadcast.put("type", "playerJoinedRoom");
        Map<String, Object> broadcastData = new HashMap<>();
        broadcastData.put("playerId", playerId);
        broadcastData.put("playerName", playerService.getPlayer(playerId).getName());
        broadcast.put("data", broadcastData);

        broadcastToRoom(roomId, objectMapper.writeValueAsString(broadcast), session.getId());
    }

    private void handleJoinRoomByCode(WebSocketSession session, Map<String, Object> data) throws Exception {
        String code = (String) data.get("joinCode");
        Long playerId = sessionPlayerMap.get(session.getId());

        Room room = roomService.getRoomByCode(code);
        if (room == null) {
            sendError(session, "Invalid join code");
            return;
        }

        Long roomId = room.getId();
        boolean success = roomService.addPlayerToRoom(roomId, playerId, playerService);

        if (!success) {
            sendError(session, "Failed to join room (might be full)");
            return;
        }

        // Track session in room
        roomSessions.computeIfAbsent(roomId, k -> ConcurrentHashMap.newKeySet()).add(session);
        sessionRoomMap.put(session.getId(), roomId);

        // Send success to player
        Map<String, Object> response = new HashMap<>();
        response.put("type", "joinedRoom");
        Map<String, Object> responseData = new HashMap<>();
        responseData.put("room", convertRoomToMap(room));
        responseData.put("players", roomService.getPlayersInRoom(roomId));
        response.put("data", responseData);
        session.sendMessage(new TextMessage(objectMapper.writeValueAsString(response)));

        // Notify others in room
        Map<String, Object> broadcast = new HashMap<>();
        broadcast.put("type", "playerJoinedRoom");
        Map<String, Object> broadcastData = new HashMap<>();
        broadcastData.put("playerId", playerId);
        broadcastData.put("playerName", playerService.getPlayer(playerId).getName());
        broadcast.put("data", broadcastData);

        broadcastToRoom(roomId, objectMapper.writeValueAsString(broadcast), session.getId());
    }

    private void handleLeaveRoom(WebSocketSession session, Map<String, Object> data) throws Exception {
        Long roomId = Long.parseLong(data.get("roomId").toString());
        Long playerId = sessionPlayerMap.get(session.getId());

        roomService.removePlayerFromRoom(roomId, playerId);

        // Remove from tracking
        Set<WebSocketSession> sessions = roomSessions.get(roomId);
        if (sessions != null) {
            sessions.remove(session);
        }
        sessionRoomMap.remove(session.getId());

        // Notify others
        Map<String, Object> broadcast = new HashMap<>();
        broadcast.put("type", "playerLeftRoom");
        Map<String, Object> broadcastData = new HashMap<>();
        broadcastData.put("playerId", playerId);
        broadcast.put("data", broadcastData);

        broadcastToRoom(roomId, objectMapper.writeValueAsString(broadcast), null);
    }

    private void handleSetReady(WebSocketSession session, Map<String, Object> data) throws Exception {
        Long roomId = Long.parseLong(data.get("roomId").toString());
        boolean isReady = (boolean) data.get("ready");
        Long playerId = sessionPlayerMap.get(session.getId());

        // Update ready status (implement in RoomService)
        roomService.setPlayerReady(roomId, playerId, isReady);

        // Notify room
        Map<String, Object> broadcast = new HashMap<>();
        broadcast.put("type", "playerReadyChanged");
        Map<String, Object> broadcastData = new HashMap<>();
        broadcastData.put("playerId", playerId);
        broadcastData.put("isReady", isReady);
        broadcast.put("data", broadcastData);

        broadcastToRoom(roomId, objectMapper.writeValueAsString(broadcast), null);
    }

    private void handleStartGame(WebSocketSession session, Map<String, Object> data) throws Exception {
        Long roomId = Long.parseLong(data.get("roomId").toString());
        Long playerId = sessionPlayerMap.get(session.getId());

        // Check if player is host (implement in RoomService)
        if (!roomService.isHost(roomId, playerId)) {
            sendError(session, "Only host can start the game");
            return;
        }

        // Send countdown
        Map<String, Object> countdownMsg = new HashMap<>();
        countdownMsg.put("type", "gameStarting");
        Map<String, Object> countdownData = new HashMap<>();
        countdownData.put("countdown", 3);
        countdownMsg.put("data", countdownData);

        broadcastToRoom(roomId, objectMapper.writeValueAsString(countdownMsg), null);

        // After countdown, send game started (in real app, use scheduler)
        // For now, send immediately
        Map<String, Object> startMsg = new HashMap<>();
        startMsg.put("type", "gameStarted");
        startMsg.put("data", new HashMap<>());

        broadcastToRoom(roomId, objectMapper.writeValueAsString(startMsg), null);
    }

    private void handlePing(WebSocketSession session) throws Exception {
        Map<String, Object> pong = new HashMap<>();
        pong.put("type", "pong");
        session.sendMessage(new TextMessage(objectMapper.writeValueAsString(pong)));
    }

    private void sendError(WebSocketSession session, String errorMessage) throws Exception {
        Map<String, Object> error = new HashMap<>();
        error.put("type", "error");
        Map<String, Object> errorData = new HashMap<>();
        errorData.put("message", errorMessage);
        error.put("data", errorData);
        session.sendMessage(new TextMessage(objectMapper.writeValueAsString(error)));
    }

    private void broadcastToAll(String message) {
        for (WebSocketSession session : allSessions) {
            if (session.isOpen()) {
                try {
                    session.sendMessage(new TextMessage(message));
                } catch (Exception e) {
                    System.err.println("Error broadcasting to all: " + e.getMessage());
                }
            }
        }
    }

    private void broadcastToRoom(Long roomId, String message, String excludeSessionId) {
        Set<WebSocketSession> sessions = roomSessions.get(roomId);
        if (sessions != null) {
            for (WebSocketSession session : sessions) {
                if (session.isOpen() && !session.getId().equals(excludeSessionId)) {
                    try {
                        session.sendMessage(new TextMessage(message));
                    } catch (Exception e) {
                        System.err.println("Error broadcasting to room: " + e.getMessage());
                    }
                }
            }
        }
    }

    private List<Map<String, Object>> convertRoomsToList(List<Room> rooms) {
        List<Map<String, Object>> result = new ArrayList<>();
        for (Room room : rooms) {
            result.add(convertRoomToMap(room));
        }
        return result;
    }

    private Map<String, Object> convertRoomToMap(Room room) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", room.getId());
        map.put("name", room.getName());
        map.put("maxPlayers", room.getMaxPlayers());
        map.put("playerCount", room.getPlayers() != null ? room.getPlayers().size() : 0);
        map.put("isPrivate", room.isPrivate());
        map.put("joinCode", room.getJoinCode());
        return map;
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
        System.out.println("Room WebSocket disconnected: " + session.getId());

        allSessions.remove(session);

        Long roomId = sessionRoomMap.get(session.getId());
        if (roomId != null) {
            Long playerId = sessionPlayerMap.get(session.getId());
            if (playerId != null) {
                // DO NOT remove player from room here. RoomSocket is ephemeral for login.
                // Gameplay handles presence via other sockets.
                // roomService.removePlayerFromRoom(roomId, playerId);

                // Notify others (optional, maybe we don't even want to notify 'left' if they
                // are just switching sockets)
                // But generally, 'left' might be useful if they actually closed the tab?
                // For now, disabling auto-remove is key to persistence.

                /*
                 * Map<String, Object> broadcast = new HashMap<>();
                 * broadcast.put("type", "playerLeftRoom");
                 * Map<String, Object> broadcastData = new HashMap<>();
                 * broadcastData.put("playerId", playerId);
                 * broadcast.put("data", broadcastData);
                 * 
                 * try {
                 * broadcastToRoom(roomId, objectMapper.writeValueAsString(broadcast), null);
                 * } catch (Exception e) {
                 * e.printStackTrace();
                 * }
                 */
            }

            Set<WebSocketSession> sessions = roomSessions.get(roomId);
            if (sessions != null) {
                sessions.remove(session);
                if (sessions.isEmpty()) {
                    roomSessions.remove(roomId);
                }
            }
        }

        sessionRoomMap.remove(session.getId());
        sessionPlayerMap.remove(session.getId());
    }
}