package com.ssafy.backend.domain.scanner.controller;

import com.ssafy.backend.domain.record.model.service.RecordService;
import com.ssafy.backend.domain.scanner.dto.ScannersDto;
import com.ssafy.backend.domain.scanner.entity.Scanners;
import com.ssafy.backend.domain.scanner.model.service.ScannersService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/scanners")
@RequiredArgsConstructor
@Tag(name = "스캐너 API", description = "스캐너 관리와 기록을 관리하는 API입니다.")
public class ScannersController {

    private final ScannersService scannersService;
    private final RecordService recordService;

    @Operation(summary = "모든 스캐너 조회", description = "등록된 모든 스캐너 정보를 조회하는 API입니다.")
    @GetMapping
    public ResponseEntity<List<ScannersDto>> getAllScanners() {
        List<ScannersDto> scanners = scannersService.getAllScanners();
        return ResponseEntity.ok(scanners);
    }

    @Operation(summary = "ID로 특정 스캐너 조회", description = "ID를 기준으로 특정 스캐너 정보를 조회하는 API입니다.")
    @GetMapping("/{id}")
    public ResponseEntity<ScannersDto> getScannerById(@PathVariable Long id) {
        Scanners scanner = scannersService.getScannerById(id); // Scanners 엔티티 반환
        // Scanners 엔티티를 ScannersDto로 변환
        ScannersDto scannerDto = new ScannersDto(
                scanner.getId(),
                scanner.getUser().getId(),
                scanner.getSerialNumber(),
                scanner.getCompletedAt(),
                scanner.getIsUsing()
        );
        return ResponseEntity.ok(scannerDto);
    }


    @Operation(summary = "새 스캐너 생성", description = "새로운 스캐너 정보를 생성하는 API입니다.")
    @PostMapping
    public ResponseEntity<ScannersDto> createScanner(@RequestBody ScannersDto scannerDto) {
        ScannersDto createdScanner = scannersService.saveScanner(scannerDto);
        return ResponseEntity.ok(createdScanner);
    }

    @Operation(summary = "ID로 스캐너 삭제", description = "ID를 기준으로 특정 스캐너 정보를 삭제하는 API입니다.")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteScanner(@PathVariable Long id) {
        scannersService.deleteScanner(id);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "스캐너 사용 시작", description = "특정 스캐너 사용을 시작하고, 사용 기록을 생성합니다.")
    @PostMapping("/{serialNumber}/start")
    public ResponseEntity<ScannersDto> startScannerUsage(@PathVariable Long serialNumber, @RequestParam Long userId) {
        ScannersDto scanner = scannersService.updateScannerUsage(serialNumber, true);
        recordService.createRecord(userId, serialNumber);
        return ResponseEntity.ok(scanner);
    }

    @Operation(summary = "스캐너 사용 중단", description = "스캐너의 사용을 중단하고, 기록을 업데이트합니다.")
    @PutMapping("/{serialNumber}/stop")
    public ResponseEntity<ScannersDto> stopScannerUsage(@PathVariable Long serialNumber) {
        ScannersDto scanner = scannersService.updateScannerUsage(serialNumber, false);
        recordService.updateRecord(serialNumber);
        return ResponseEntity.ok(scanner);
    }
}