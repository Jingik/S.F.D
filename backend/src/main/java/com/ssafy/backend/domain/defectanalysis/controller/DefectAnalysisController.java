package com.ssafy.backend.domain.defectanalysis.controller;

import com.ssafy.backend.domain.defectanalysis.entity.DefectAnalysis;
import com.ssafy.backend.domain.defectanalysis.service.DefectAnalysisService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/defect-analysis")
@Tag(name = "객체 탐지 ", description = "관리자 전용 API를 제공하는 컨트롤러입니다.")
public class DefectAnalysisController {

    private final DefectAnalysisService defectAnalysisService;

    @GetMapping("/detection/{objectDetectionId}")
    public List<DefectAnalysis> getDefectAnalysisByObjectDetectionId(@PathVariable Long objectDetectionId) {
        return defectAnalysisService.getDefectAnalysisByObjectDetectionId(objectDetectionId);
    }

    @PostMapping("/add")
    public DefectAnalysis addDefectAnalysis(@RequestBody DefectAnalysis defectAnalysis) {
        return defectAnalysisService.saveDefectAnalysis(defectAnalysis);
    }
}
