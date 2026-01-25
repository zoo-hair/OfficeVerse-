package com.offficeVerse.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
public class ChatMessage {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String senderName;
    private String message;

    private LocalDateTime timestamp;

    public String getSender() { return senderName; }
    public String getContent() { return message; }

    @ManyToOne
    @JoinColumn(name = "room_id")
    private Room room;

    protected ChatMessage() {}

    public ChatMessage(String senderName, String message, Room room) {
        this.senderName = senderName;
        this.message = message;
        this.room = room;
        this.timestamp = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public String getSenderName() { return senderName; }
    public String getMessage() { return message; }
    public LocalDateTime getTimestamp() { return timestamp; }
    public Room getRoom() { return room; }

    public void setSenderName(String senderName) { this.senderName = senderName; }
    public void setMessage(String message) { this.message = message; }
    public void setRoom(Room room) { this.room = room; }
}
