package com.offficeVerse.controller;

import com.offficeVerse.model.Player;
import com.offficeVerse.model.Room;
import com.offficeVerse.service.PlayerService;
import com.offficeVerse.service.RoomService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private final PlayerService playerService;
    private final RoomService roomService;

    public AuthController(PlayerService playerService, RoomService roomService) {
        this.playerService = playerService;
        this.roomService = roomService;
    }

    @PostMapping("/register")
    public Player registerPlayer(@RequestParam String name, @RequestParam(required = false) Long roomId) {
        Room room = null;
        if (roomId != null) {
            room = roomService.getRoom(roomId);
        }
        return playerService.createPlayer(name, room);
    }

    @GetMapping("/player/{id}")
    public Player getPlayer(@PathVariable Long id) {
        return playerService.getPlayer(id);
    }
}

