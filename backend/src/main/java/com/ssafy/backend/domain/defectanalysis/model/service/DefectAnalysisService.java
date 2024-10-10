package com.ssafy.backend.domain.defectanalysis.model.service;

import com.ssafy.backend.domain.defectanalysis.dto.DefectAnalysisDto;
import com.ssafy.backend.domain.defectanalysis.entity.AnalysisDetails;
import com.ssafy.backend.domain.defectanalysis.entity.DefectAnalysis;
import com.ssafy.backend.domain.defectanalysis.model.repository.DefectAnalysisRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.Assert;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DefectAnalysisService {

    private final DefectAnalysisRepository defectAnalysisRepository;

    // Object Detection ID로 분석 정보 조회
    public List<DefectAnalysisDto> getDefectAnalysisByObjectDetectionId(Long objectDetectionId) {
        List<DefectAnalysis> analyses = defectAnalysisRepository.findByObjectDetectionId(objectDetectionId);
        return analyses.stream()
                .map(analysis -> new DefectAnalysisDto(analysis.getId(), analysis.getAnalysisDetails().name(), analysis.getConfidence(), analysis.getTimestamp()))
                .collect(Collectors.toList());
    }


    // 모든 분석 데이터 조회
    public List<DefectAnalysisDto> getAllAnalyses() {
        List<DefectAnalysis> analyses = defectAnalysisRepository.findAll();
        return analyses.stream()
                .map(analysis -> new DefectAnalysisDto(analysis.getId(), analysis.getAnalysisDetails().name(), analysis.getConfidence(), analysis.getTimestamp()))
                .collect(Collectors.toList());
    }

    // 특정 ID로 분석 정보 조회
    public DefectAnalysisDto getAnalysisById(Long id) {
        DefectAnalysis analysis = defectAnalysisRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("No analysis found with the given ID"));
        return new DefectAnalysisDto(analysis.getId(), analysis.getAnalysisDetails().name(), analysis.getConfidence(), analysis.getTimestamp());
    }

}
