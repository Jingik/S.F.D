package com.ssafy.backend.domain.defectanalysis.controller;

import com.ssafy.backend.domain.defectanalysis.dto.DefectAnalysisDto;
import com.ssafy.backend.domain.defectanalysis.model.service.DefectAnalysisService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/defect-analyses")
@RequiredArgsConstructor
@Tag(name = "불량 분석 API", description = "불량 분석 데이터와 관련된 API를 제공합니다.")
public class DefectAnalysisController {

    private final DefectAnalysisService defectAnalysisService;

    @Operation(summary = "모든 불량 분석 데이터 조회", description = "모든 불량 분석 데이터를 조회하는 API입니다.")
    @GetMapping
    public ResponseEntity<List<DefectAnalysisDto>> getAllAnalyses() {
        List<DefectAnalysisDto> analyses = defectAnalysisService.getAllAnalyses();
        return ResponseEntity.ok(analyses);
    }

    @Operation(summary = "ID로 특정 불량 분석 데이터 조회", description = "ID를 기준으로 특정 불량 분석 데이터를 조회하는 API입니다.")
    @GetMapping("/{id}")
    public ResponseEntity<DefectAnalysisDto> getAnalysisById(@PathVariable Long id) {
        DefectAnalysisDto analysis = defectAnalysisService.getAnalysisById(id);
        return ResponseEntity.ok(analysis);
    }
}