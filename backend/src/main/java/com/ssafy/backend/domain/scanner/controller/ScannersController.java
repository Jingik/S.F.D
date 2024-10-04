package com.ssafy.backend.domain.scanner.controller;

import com.ssafy.backend.domain.scanner.entity.Scanners;
import com.ssafy.backend.domain.scanner.service.ScannersService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor

@RequestMapping("/scanners")
@Tag(name = "스캐너 관리", description = "스캐너와 관련된 API를 제공합니다.")
public class ScannersController {

    private final ScannersService scannersService;

    @Operation(
            summary = "유저별 스캐너 기록 조회",
            description = "해당 유저의 모든 스캐너 기록을 조회합니다."
    )
    @GetMapping("/user/{userId}")
    public List<Scanners> getScannersByUserId(@PathVariable Long userId) {
        return scannersService.getScannersByUserId(userId);
    }

    @Operation(
            summary = "스캐너 기록 추가",
            description = "새로운 스캐너 기록을 추가합니다."
    )
    @PostMapping("/add")
    public Scanners addScanner(@RequestBody Scanners scanner) {
        return scannersService.saveScanner(scanner);
    }
}