package com.offficeVerse.service;

import com.offficeVerse.model.Room;
import com.offficeVerse.model.Player;
import com.offficeVerse.repository.RoomRepository;
import org.springframework.stereotype.Service;

import java.util.*;

import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional("transactionManager")
public class RoomService {

    private final RoomRepository roomRepository;

    public RoomService(RoomRepository roomRepository) {
        this.roomRepository = roomRepository;
    }

    public Room createRoom(String name) {
        Room room = new Room(name);
        return roomRepository.save(room);
    }

    public Room getRoomByName(String name) {
        Room room = roomRepository.findByName(name);
        if (room != null) {
            room.getPlayers().size(); // Initialize lazy collection
        }
        return room;
    }

    public void deleteRoom(Long id) {
        roomRepository.deleteById(id);
    }

    public String getRoomType(Long roomId) {
        Room room = getRoom(roomId);
        if (room != null) {
            return room.getRoomType();
        }
        return "NORMAL";
    }

    public Room createRoom(String name, int maxPlayers, boolean isPrivate, Long hostId) {
        Room room = new Room();
        room.setName(name);
        room.setMaxPlayers(maxPlayers);
        room.setPrivate(isPrivate);
        room.setHostId(hostId);
        room.setJoinCode(generateUniqueJoinCode());
        room.setPlayers(new ArrayList<>());
        // Save to database
        Room savedRoom = roomRepository.save(room);
        savedRoom.getPlayers().size(); // Initialize
        return savedRoom;
    }

    public Room getRoomByCode(String code) {
        Room room = roomRepository.findByJoinCode(code);
        if (room != null) {
            room.getPlayers().size(); // Initialize lazy collection
        }
        return room;
    }

    private String generateUniqueJoinCode() {
        String characters = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Removed ambiguous characters
        StringBuilder code = new StringBuilder();
        Random rnd = new Random();
        while (code.length() < 6) {
            code.append(characters.charAt(rnd.nextInt(characters.length())));
        }

        // Ensure uniqueness (recursive)
        if (getRoomByCode(code.toString()) != null) {
            return generateUniqueJoinCode();
        }

        return code.toString();
    }

    public boolean addPlayerToRoom(Long roomId, Long playerId, PlayerService playerService) {
        Room room = getRoom(roomId);
        Player player = playerService.getPlayer(playerId);

        if (room == null || player == null) {
            return false;
        }

        if (room.getPlayers().size() >= room.getMaxPlayers()) {
            return false;
        }

        if (!room.getPlayers().contains(player)) {
            room.getPlayers().add(player);
            player.setRoom(room);
            playerService.savePlayer(player);
            roomRepository.save(room);
        }

        return true;
    }

    public void removePlayerFromRoom(Long roomId, Long playerId) {
        Room room = getRoom(roomId);
        if (room != null) {
            room.getPlayers().removeIf(p -> p.getId().equals(playerId));

            // If room is empty, optionally delete it
            if (room.getPlayers().isEmpty()) {
                roomRepository.delete(room);
            } else {
                roomRepository.save(room);
            }
        }
    }

    public List<Player> getPlayersInRoom(Long roomId) {
        Room room = getRoom(roomId);
        return room != null ? room.getPlayers() : new ArrayList<>();
    }

    public void setPlayerReady(Long roomId, Long playerId, boolean ready) {
        // Implement ready status tracking
        // You might want to add a Map<Long, Boolean> readyStatus field to Room entity
        Room room = getRoom(roomId);
        if (room != null) {
            // Store ready status
            // room.getReadyStatus().put(playerId, ready);
            // roomRepository.save(room);
        }
    }

    public boolean isHost(Long roomId, Long playerId) {
        Room room = getRoom(roomId);
        return room != null && room.getHostId() != null && room.getHostId().equals(playerId);
    }

    public List<Room> getAllRooms() {
        return roomRepository.findAll();
    }

    public Room getRoom(Long id) {
        Room room = roomRepository.findById(id).orElse(null);
        if (room != null) {
            room.getPlayers().size(); // Initialize lazy collection
        }
        return room;
    }
}
