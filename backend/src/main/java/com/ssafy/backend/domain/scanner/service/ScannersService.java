package com.ssafy.backend.domain.scanner.service;

import com.ssafy.backend.domain.scanner.entity.Scanners;
import com.ssafy.backend.domain.scanner.repository.ScannersRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ScannersService {

    private final ScannersRepository scannersRepository;

    public List<Scanners> getScannersByUserId(Long userId) {
        return scannersRepository.findByUserId(userId);
    }

    public Scanners saveScanner(Scanners scanner) {
        return scannersRepository.save(scanner);
    }
}
