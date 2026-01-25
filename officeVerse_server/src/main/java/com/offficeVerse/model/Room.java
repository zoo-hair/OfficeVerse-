package com.offficeVerse.model;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.*;

@Getter
@Setter
// @NoArgsConstructor(access = AccessLevel.PROTECTED)
@Entity
@Table(name = "rooms")
public class Room {

        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        private Long id;

        @Column(nullable = false)
        private String name;

        private String roomType; // meeting, desk
        private int maxPlayers = 20;
        private boolean isPrivate = false;
        private String password;
        private String joinCode; // Unique code for employees to join
        private Long hostId;

        @OneToMany(mappedBy = "room", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
        private List<Player> players = new ArrayList<>();

        @OneToMany(mappedBy = "room", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
        private List<ChatMessage> messages = new ArrayList<>();

        @ElementCollection
        @CollectionTable(name = "room_ready_status", joinColumns = @JoinColumn(name = "room_id"))
        @MapKeyJoinColumn(name = "player_id")
        @Column(name = "is_ready")
        private Map<Player, Boolean> readyStatus = new HashMap<>();

        private LocalDateTime createdAt = LocalDateTime.now();

        public Room(String name) {
                this.name = name;
        }

        public Room() {

        }
}
