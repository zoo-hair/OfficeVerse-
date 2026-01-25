package com.offficeVerse.service;

import com.offficeVerse.model.Position;
import com.offficeVerse.repository.PositionRepository;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class PositionService {

    private final PositionRepository positionRepository;

    public PositionService(PositionRepository positionRepository) {
        this.positionRepository = positionRepository;
    }

    public Position savePosition(Position position) {
        return positionRepository.save(position);
    }

    public Position getPosition(Long id) {
        Optional<Position> position = positionRepository.findById(id);
        return position.orElse(null);
    }

    public void deletePosition(Long id) {
        positionRepository.deleteById(id);
    }
}
