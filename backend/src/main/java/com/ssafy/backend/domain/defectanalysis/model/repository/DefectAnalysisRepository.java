package com.ssafy.backend.domain.defectanalysis.model.repository;

import com.ssafy.backend.domain.defectanalysis.entity.DefectAnalysis;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DefectAnalysisRepository extends JpaRepository<DefectAnalysis, Long> {
    List<DefectAnalysis> findByObjectDetectionId(Long objectDetectionId);
}
