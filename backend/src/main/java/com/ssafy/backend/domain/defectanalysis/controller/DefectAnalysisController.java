package com.ssafy.backend.domain.defectanalysis.controller;

import com.ssafy.backend.domain.defectanalysis.entity.DefectAnalysis;
import com.ssafy.backend.domain.defectanalysis.model.service.DefectAnalysisService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/defect-analyses")
@RequiredArgsConstructor
public class DefectAnalysisController {

    private final DefectAnalysisService defectAnalysisService;

    @GetMapping
    public ResponseEntity<List<DefectAnalysis>> getAllAnalyses() {
        List<DefectAnalysis> analyses = defectAnalysisService.getAllAnalyses();
        return ResponseEntity.ok(analyses);
    }

    @GetMapping("/{id}")
    public ResponseEntity<DefectAnalysis> getAnalysisById(@PathVariable Long id) {
        DefectAnalysis analysis = defectAnalysisService.getAnalysisById(id);
        return ResponseEntity.ok(analysis);
    }

//    @PostMapping
//    public ResponseEntity<DefectAnalysis> createAnalysis(@RequestBody DefectAnalysis analysis) {
//        DefectAnalysis createdAnalysis = defectAnalysisService.saveDefectAnalysis(analysis);
//        return ResponseEntity.ok(createdAnalysis);
//    }
//
//    @DeleteMapping("/{id}")
//    public ResponseEntity<Void> deleteAnalysis(@PathVariable Long id) {
//        defectAnalysisService.deleteAnalysis(id);
//        return ResponseEntity.ok().build();
//    }
}
