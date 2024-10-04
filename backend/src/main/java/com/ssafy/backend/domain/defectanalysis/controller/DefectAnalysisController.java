package com.ssafy.backend.domain.defectanalysis.controller;

import com.ssafy.backend.domain.defectanalysis.entity.DefectAnalysis;
import com.ssafy.backend.domain.defectanalysis.service.DefectAnalysisService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/defect-analysis")
@Tag(name = "결함 분석", description = "결함 분석과 관련된 API를 제공합니다.")
public class DefectAnalysisController {

    private final DefectAnalysisService defectAnalysisService;

    @Operation(
            summary = "객체 감지별 결함 분석 조회",
            description = "해당 객체 감지 기록에 대한 결함 분석 결과를 조회합니다."
    )
    @GetMapping("/detection/{objectDetectionId}")
    public List<DefectAnalysis> getDefectAnalysisByObjectDetectionId(@PathVariable Long objectDetectionId) {
        return defectAnalysisService.getDefectAnalysisByObjectDetectionId(objectDetectionId);
    }

    @Operation(
            summary = "결함 분석 기록 추가",
            description = "새로운 결함 분석 기록을 추가합니다."
    )
    @PostMapping("/add")
    public DefectAnalysis addDefectAnalysis(@RequestBody DefectAnalysis defectAnalysis) {
        return defectAnalysisService.saveDefectAnalysis(defectAnalysis);
    }
}
