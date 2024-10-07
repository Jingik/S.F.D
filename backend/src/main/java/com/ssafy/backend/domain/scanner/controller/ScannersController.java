package com.ssafy.backend.domain.scanner.controller;

import com.ssafy.backend.domain.scanner.entity.Scanners;
import com.ssafy.backend.domain.scanner.model.service.ScannersService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/scanners")
@RequiredArgsConstructor
public class ScannersController {

    private final ScannersService scannersService;

    @GetMapping
    public ResponseEntity<List<Scanners>> getAllScanners() {
        List<Scanners> scanners = scannersService.getAllScanners();
        return ResponseEntity.ok(scanners);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Scanners> getScannerById(@PathVariable Long id) {
        Scanners scanner = scannersService.getScannerById(id);
        return ResponseEntity.ok(scanner);
    }

    @PostMapping
    public ResponseEntity<Scanners> createScanner(@RequestBody Scanners scanner) {
        Scanners createdScanner = scannersService.saveScanner(scanner);
        return ResponseEntity.ok(createdScanner);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteScanner(@PathVariable Long id) {
        scannersService.deleteScanner(id);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{serialNumber}/usage")
    public ResponseEntity<Scanners> updateScannerUsage(@PathVariable Long serialNumber, @RequestParam boolean isUsing) {
        Scanners updatedScanner = scannersService.updateScannerUsage(serialNumber, isUsing);
        return ResponseEntity.ok(updatedScanner);
    }
}
