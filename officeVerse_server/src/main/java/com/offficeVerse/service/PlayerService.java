package com.offficeVerse.service;

import com.offficeVerse.model.Player;
import com.offficeVerse.model.Room;
import com.offficeVerse.repository.PlayerRepository;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class PlayerService {

    private final PlayerRepository playerRepository;

    public PlayerService(PlayerRepository playerRepository) {
        this.playerRepository = playerRepository;
    }

    public Player createPlayer(String name, Room room) {
        Player player = new Player(name, room);
        return playerRepository.save(player); // persist in DB
    }

    public Player savePlayer(Player player) {
        return playerRepository.save(player);
    }

    public Player getPlayer(Long id) {
        Optional<Player> player = playerRepository.findById(id);
        return player.orElse(null); // returns null if not found
    }

    public void deletePlayer(Long id) {
        playerRepository.deleteById(id);
    }
}
