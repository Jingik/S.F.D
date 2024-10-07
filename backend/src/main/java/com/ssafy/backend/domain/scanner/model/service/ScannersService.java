package com.ssafy.backend.domain.scanner.model.service;

import com.ssafy.backend.domain.scanner.entity.Scanners;
import com.ssafy.backend.domain.scanner.model.repository.ScannersRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ScannersService {

    private final ScannersRepository scannersRepository;

    public List<Scanners> getAllScanners() {
        return scannersRepository.findAll();
    }

    public Scanners getScannerById(Long id) {
        return scannersRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Scanner not found with ID: " + id));
    }

    public Scanners saveScanner(Scanners scanner) {
        return scannersRepository.save(scanner);
    }

    public void deleteScanner(Long id) {
        if (scannersRepository.existsById(id)) {
            scannersRepository.deleteById(id);
        } else {
            throw new IllegalArgumentException("Scanner not found with ID: " + id);
        }
    }

    public Scanners updateScannerUsage(Long serialNumber, boolean isUsing) {
        Scanners scanner = findBySerialNumber(serialNumber);
        if (scanner == null) {
            throw new IllegalArgumentException("Scanner not found with Serial Number: " + serialNumber);
        }

        scanner.setIsUsing(isUsing);
        if (!isUsing) {
            scanner.setCompletedAt(LocalDateTime.now());
        }
        return scannersRepository.save(scanner);
    }

    public Scanners findBySerialNumber(Long serialNumber) {
        Optional<Scanners> scanner = scannersRepository.findBySerialNumber(serialNumber);
        return scanner.orElse(null);
    }
}
