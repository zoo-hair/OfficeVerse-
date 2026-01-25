package com.offficeVerse.repository;

import com.offficeVerse.model.Position;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PositionRepository extends JpaRepository<Position, Long> {
    // Could add methods like findByPlayerId if needed
}
