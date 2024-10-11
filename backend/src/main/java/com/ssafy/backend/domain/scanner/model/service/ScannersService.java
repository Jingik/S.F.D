package com.ssafy.backend.domain.scanner.model.service;

import com.ssafy.backend.domain.scanner.dto.ScannersDto;
import com.ssafy.backend.domain.scanner.entity.Scanners;
import com.ssafy.backend.domain.scanner.model.repository.ScannersRepository;
import com.ssafy.backend.domain.user.entity.User;
import com.ssafy.backend.domain.user.model.repository.UserRepository;
import com.ssafy.backend.domain.user.model.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ScannersService {

    private final ScannersRepository scannersRepository;
    private final UserRepository userRepository;  // UserRepository 주입
    private final UserService userService;

    // 모든 스캐너 조회 (userId 포함)
    public List<ScannersDto> getAllScanners() {
        List<Scanners> scanners = scannersRepository.findAll();
        return scanners.stream()
                .map(scanner -> new ScannersDto(scanner.getId(), scanner.getUser().getId(), scanner.getSerialNumber(), scanner.getCompletedAt(), scanner.getIsUsing()))  // userId 추가
                .collect(Collectors.toList());
    }

    // 특정 ID로 스캐너 조회 (엔티티 반환)
    public Scanners getScannerById(Long id) {
        return scannersRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Scanner not found with ID: " + id));
    }

    public ScannersDto saveScanner(ScannersDto scannerDto) {
        // 사용자 조회
        User user = userService.getUserById(scannerDto.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다. ID: " + scannerDto.getUserId()));

        // Scanners 엔티티 생성
        Scanners scanner = Scanners.builder()
                .user(user)  // 반드시 User 객체를 설정
                .serialNumber(scannerDto.getSerialNumber())  // 시리얼 넘버 설정
                .isUsing(scannerDto.getIsUsing())  // 스캐너 사용 상태 설정
                .build();

        // 스캐너 저장
        Scanners savedScanner = scannersRepository.save(scanner);

        // 저장된 데이터를 다시 DTO로 변환하여 반환
        return ScannersDto.builder()
                .id(savedScanner.getId())
                .userId(savedScanner.getUser().getId())
                .serialNumber(savedScanner.getSerialNumber())
                .isUsing(savedScanner.getIsUsing())
                .completedAt(savedScanner.getCompletedAt())
                .build();
    }


    // 스캐너 삭제
    public void deleteScanner(Long id) {
        if (scannersRepository.existsById(id)) {
            scannersRepository.deleteById(id);
        } else {
            throw new IllegalArgumentException("Scanner not found with ID: " + id);
        }
    }

    // 스캐너 사용 상태 업데이트 (serialNumber는 고정값 1)
    public ScannersDto updateScannerUsage(Long scannerId, boolean isUsing) {
        Scanners scanner = scannersRepository.findById(scannerId)
                .orElseThrow(() -> new IllegalArgumentException("Scanner not found with ID: " + scannerId));

        // 사용 여부 업데이트
        scanner.setIsUsing(isUsing);

        // 사용 중단 시 완료 시간 설정
        if (!isUsing) {
            scanner.setCompletedAt(LocalDateTime.now());
        }

        Scanners updatedScanner = scannersRepository.save(scanner);
        return new ScannersDto(updatedScanner.getId(), updatedScanner.getUser().getId(), updatedScanner.getSerialNumber(), updatedScanner.getCompletedAt(), updatedScanner.getIsUsing());
    }

    // 가장 최근 사용 중인 스캐너 조회 (사용자 ID 사용 안 함)
    public Scanners findMostRecentActiveScanner() {
        return scannersRepository.findTopByIsUsingOrderByIdDesc(true)
                .orElseThrow(() -> new IllegalArgumentException("사용 중인 스캐너가 없습니다."));
    }

    public List<Scanners> findAllActiveScanners() {
        return scannersRepository.findByIsUsing(true);
    }
}