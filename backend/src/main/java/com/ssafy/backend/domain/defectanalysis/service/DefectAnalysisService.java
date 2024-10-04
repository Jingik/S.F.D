package com.ssafy.backend.domain.defectanalysis.service;

import com.ssafy.backend.domain.defectanalysis.entity.DefectAnalysis;
import com.ssafy.backend.domain.defectanalysis.repository.DefectAnalysisRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DefectAnalysisService {

    private final DefectAnalysisRepository defectAnalysisRepository;

    public List<DefectAnalysis> getDefectAnalysisByObjectDetectionId(Long objectDetectionId) {
        return defectAnalysisRepository.findByObjectDetectionId(objectDetectionId);
    }

    public DefectAnalysis saveDefectAnalysis(DefectAnalysis defectAnalysis) {
        return defectAnalysisRepository.save(defectAnalysis);
    }
}
