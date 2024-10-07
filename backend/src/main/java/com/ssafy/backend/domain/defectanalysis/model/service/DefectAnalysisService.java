package com.ssafy.backend.domain.defectanalysis.model.service;

import com.ssafy.backend.domain.defectanalysis.entity.DefectAnalysis;
import com.ssafy.backend.domain.defectanalysis.model.repository.DefectAnalysisRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.Assert;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DefectAnalysisService {

    private final DefectAnalysisRepository defectAnalysisRepository;

    // Object Detection ID로 분석 정보 조회
    public List<DefectAnalysis> getDefectAnalysisByObjectDetectionId(Long objectDetectionId) {
        return defectAnalysisRepository.findByObjectDetectionId(objectDetectionId);
    }

    // 새로운 Defect Analysis 저장
    public DefectAnalysis saveDefectAnalysis(DefectAnalysis defectAnalysis) {
        // 필수 필드 검증
        Assert.notNull(defectAnalysis.getObjectDetection(), "Object Detection must not be null");
        Assert.notNull(defectAnalysis.getAnalysisDetails(), "Analysis Details must not be null");

        return defectAnalysisRepository.save(defectAnalysis);
    }

    // 모든 분석 데이터 조회
    public List<DefectAnalysis> getAllAnalyses() {
        return defectAnalysisRepository.findAll();
    }

    // 특정 ID로 분석 정보 조회
    public DefectAnalysis getAnalysisById(Long id) {
        return defectAnalysisRepository.findById(id).orElseThrow(() ->
                new IllegalArgumentException("No analysis found with the given ID"));
    }

    // 분석 정보 삭제
    public void deleteAnalysis(Long id) {
        defectAnalysisRepository.deleteById(id);
    }
}
