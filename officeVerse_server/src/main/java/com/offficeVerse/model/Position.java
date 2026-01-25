package com.offficeVerse.model;

import jakarta.persistence.*;

@Entity
public class Position {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    public int x;
    public int y;

    @OneToOne
    @JoinColumn(name = "player_id")
    private Player player;

    protected Position() {}

    public Position(int x, int y, Player player) {
        this.x = x;
        this.y = y;
        this.player = player;
    }

    public Long getId() { return id; }
    public int getX() { return x; }
    public int getY() { return y; }
    public Player getPlayer() { return player; }

    public void setX(int x) { this.x = x; }
    public void setY(int y) { this.y = y; }
    public void setPlayer(Player player) { this.player = player; }

}
