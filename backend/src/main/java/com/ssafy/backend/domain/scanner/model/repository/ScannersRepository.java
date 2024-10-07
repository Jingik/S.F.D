package com.ssafy.backend.domain.scanner.model.repository;

import com.ssafy.backend.domain.scanner.entity.Scanners;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ScannersRepository extends JpaRepository<Scanners, Long> {
    Optional<Scanners> findBySerialNumber(Long serialNumber);
}
