package com.offficeVerse.config;

import com.offficeVerse.websocket.*;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.*;

@Configuration
@EnableWebSocket
public class WebSocketConfig implements WebSocketConfigurer {

        private final ChatSocket chatSocket;
        private final MovementSocket movementSocket;
        private final RoomSocket roomSocket;
        private final ZoneSocket zoneSocket;

        public WebSocketConfig(ChatSocket chatSocket,
                        MovementSocket movementSocket,
                        RoomSocket roomSocket,
                        ZoneSocket zoneSocket) {
                this.chatSocket = chatSocket;
                this.movementSocket = movementSocket;
                this.roomSocket = roomSocket;
                this.zoneSocket = zoneSocket;
        }

        @Override
        public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
                // Chat WebSocket
                registry.addHandler(chatSocket, "/chat")
                                .setAllowedOrigins("*");

                // Movement WebSocket
                registry.addHandler(movementSocket, "/movement")
                                .setAllowedOrigins("*");

                // Room WebSocket
                registry.addHandler(roomSocket, "/rooms")
                                .setAllowedOrigins("*");

                // Zone WebSocket
                registry.addHandler(zoneSocket, "/zones")
                                .setAllowedOrigins("*");
        }
}