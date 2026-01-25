package com.offficeVerse.model;

import jakarta.persistence.*;

@Entity
public class Player {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;
    private String name;

    public Player() {
    }

    @ManyToOne
    @JoinColumn(name = "room_id")
    @com.fasterxml.jackson.annotation.JsonIgnore
    private Room room;

    public Player(String name, Room room) {
        this.name = name;
        this.room = room;
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public Room getRoom() {
        return room;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setRoom(Room room) {
        this.room = room;
    }
}
