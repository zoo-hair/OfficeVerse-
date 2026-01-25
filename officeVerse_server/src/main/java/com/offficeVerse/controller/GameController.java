package com.offficeVerse.controller;

import com.offficeVerse.model.Player;
import com.offficeVerse.model.Position;
import com.offficeVerse.service.PlayerService;
import com.offficeVerse.service.PositionService;
import com.offficeVerse.service.RoomService;
import com.offficeVerse.service.genAIService;
import com.offficeVerse.service.DiscordService;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/game")
@CrossOrigin(origins = "*")
public class GameController {

    private final PlayerService playerService;
    private final RoomService roomService;
    private final PositionService positionService;

    public GameController(PlayerService playerService, RoomService roomService, PositionService positionService) {
        this.playerService = playerService;
        this.roomService = roomService;
        this.positionService = positionService;
    }

    @PostMapping("/update-position")
    public Position updatePosition(@RequestParam Long playerId, @RequestParam int x, @RequestParam int y) {
        Player player = playerService.getPlayer(playerId);
        if (player == null) return null;
        Position pos = new Position(x, y, player);
        return positionService.savePosition(pos);
    }

    @GetMapping("/player-position/{playerId}")
    public Position getPosition(@PathVariable Long playerId) {
        return positionService.getPosition(playerId);
    }

   /* @PostMapping("/room-action")
    public String handleRoomAction(@RequestParam Long playerId, @RequestParam Long roomId, @RequestParam String message) {
        String roomType = roomService.getRoomType(roomId);

        switch(roomType) {
            case "MEETING":
                return DiscordService.sendMessageToDiscord(message);
            case "AI_LAB":
                return genAIService.getResponse(message);
            default:
                return "Normal room: message stored in DB or ignored";
        }
    } */
}
