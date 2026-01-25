package com.offficeVerse.repository;

import com.offficeVerse.model.Room;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RoomRepository extends JpaRepository<Room, Long> {
    Room findByName(String name);

    Room findByJoinCode(String joinCode);
}
