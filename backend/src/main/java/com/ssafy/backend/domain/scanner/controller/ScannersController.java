package com.ssafy.backend.domain.scanner.controller;

import com.ssafy.backend.domain.scanner.entity.Scanners;
import com.ssafy.backend.domain.scanner.service.ScannersService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/scanners")
public class ScannersController {

    private final ScannersService scannersService;

    @GetMapping("/user/{userId}")
    public List<Scanners> getScannersByUserId(@PathVariable Long userId) {
        return scannersService.getScannersByUserId(userId);
    }

    @PostMapping("/add")
    public Scanners addScanner(@RequestBody Scanners scanner) {
        return scannersService.saveScanner(scanner);
    }
}
