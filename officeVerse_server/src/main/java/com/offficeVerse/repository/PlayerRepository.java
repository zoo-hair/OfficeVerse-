package com.offficeVerse.repository;

import com.offficeVerse.model.Player;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PlayerRepository extends JpaRepository<Player, Long> {
    // Custom query add korar jonno
}
