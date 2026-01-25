package com.offficeVerse.service;

import com.offficeVerse.model.ChatMessage;
import com.offficeVerse.repository.ChatMessageRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ChatService {

    private final ChatMessageRepository chatMessageRepository;

    public ChatService(ChatMessageRepository chatMessageRepository) {
        this.chatMessageRepository = chatMessageRepository;
    }

    public ChatMessage saveMessage(ChatMessage message) {
        return chatMessageRepository.save(message);
    }

    public List<ChatMessage> getMessagesByRoom(Long roomId) {
        return chatMessageRepository.findByRoomId(roomId);
    }

    public void deleteMessage(Long id) {
        chatMessageRepository.deleteById(id);
    }
}
