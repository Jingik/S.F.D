    package com.ssafy.backend.domain.record.model.service;

    import com.ssafy.backend.domain.defectanalysis.entity.AnalysisDetails;
    import com.ssafy.backend.domain.defectanalysis.entity.DefectAnalysis;
    import com.ssafy.backend.domain.record.dto.RecordDto;
    import com.ssafy.backend.domain.objectdetection.entity.ObjectDetection;
    import com.ssafy.backend.domain.objectdetection.model.repository.ObjectDetectionRepository;
    import com.ssafy.backend.domain.defectanalysis.model.repository.DefectAnalysisRepository;
    import com.ssafy.backend.domain.scanner.entity.Scanners;
    import com.ssafy.backend.domain.scanner.model.repository.ScannersRepository;
    import com.ssafy.backend.global.exception.NoRecordFoundException;
    import lombok.RequiredArgsConstructor;
    import org.springframework.stereotype.Service;

    import java.time.LocalDate;
    import java.time.LocalDateTime;
    import java.util.List;
    import java.util.stream.Collectors;

    @Service
    @RequiredArgsConstructor
    public class RecordService {

        private final ObjectDetectionRepository objectDetectionRepository;
        private final DefectAnalysisRepository defectAnalysisRepository;
        private final ScannersRepository scannersRepository;

        // 최근 7일간 데이터 조회
        public List<RecordDto> getRecent7DaysRecords(Long userId) {
            LocalDateTime sevenDaysAgo = LocalDateTime.now().minusDays(7);
            List<ObjectDetection> detections = objectDetectionRepository.findByScanners_UserIdAndCompletedAtAfter(userId, sevenDaysAgo);

            return detections.stream().map(detection -> {
                DefectAnalysis defect = defectAnalysisRepository.findByObjectDetectionId(detection.getId()).stream().findFirst().orElse(null);
                return createRecordDto(detection, defect);
            }).collect(Collectors.toList());
        }

        // 가장 최신의 데이터를 조회하는 메서드
        public RecordDto getLatestRecord(Long userId) {
            ObjectDetection latestDetection = objectDetectionRepository.findTopByScanners_UserIdOrderByCompletedAtDesc(userId)
                    .orElseThrow(() -> new NoRecordFoundException("최근 기록을 찾을 수 없습니다."));

            DefectAnalysis defect = defectAnalysisRepository.findByObjectDetectionId(latestDetection.getId())
                    .stream().findFirst().orElse(null);

            return createRecordDto(latestDetection, defect);
        }

        // 사용자별 스캐너 사용 기록 조회
        public List<RecordDto> getUserScannerRecords(Long userId) {
            List<ObjectDetection> detections = objectDetectionRepository.findByScanners_UserId(userId);

            return detections.stream().map(detection -> {
                DefectAnalysis defect = defectAnalysisRepository.findByObjectDetectionId(detection.getId()).stream().findFirst().orElse(null);
                return createRecordDto(detection, defect);
            }).collect(Collectors.toList());
        }

        // 새로운 기록을 생성하는 메서드
        public void createRecord(Long userId, Long serialNumber) {
            Scanners scanner = scannersRepository.findById(serialNumber)
                    .orElseThrow(() -> new IllegalArgumentException("스캐너를 찾을 수 없습니다."));

            // 새로운 ObjectDetection 기록 생성
            ObjectDetection objectDetection = new ObjectDetection();
            objectDetection.setScanners(scanner);
            objectDetection.setCompletedAt(LocalDateTime.now());
            objectDetection.setDetectionType(1); // 예시로 정상으로 설정

            objectDetectionRepository.save(objectDetection);
        }

        // 오늘 날짜에 해당하는 불량 객체만 조회하는 메서드
        public List<RecordDto> getTodayDefectiveRecords(Long userId) {
            LocalDateTime startOfToday = LocalDate.now().atStartOfDay();  // 오늘 시작 시간
            List<ObjectDetection> defectiveRecords = objectDetectionRepository
                    .findByScanners_UserIdAndCompletedAtAfterAndDetectionType(userId, startOfToday, 1);

            return defectiveRecords.stream().map(detection -> {
                DefectAnalysis defect = defectAnalysisRepository.findByObjectDetectionId(detection.getId()).stream().findFirst().orElse(null);
                return createRecordDto(detection, defect);
            }).collect(Collectors.toList());
        }

        // 기존 기록을 업데이트하는 메서드
        public void updateRecord(Long serialNumber) {
            ObjectDetection detection = objectDetectionRepository.findByScanners_Id(serialNumber)
                    .stream().findFirst().orElseThrow(() -> new NoRecordFoundException("기록을 찾을 수 없습니다."));

            // 예시로 CompletedAt을 현재 시간으로 업데이트
            detection.setCompletedAt(LocalDateTime.now());
            objectDetectionRepository.save(detection);
        }

        // DTO 변환 메서드
        private RecordDto createRecordDto(ObjectDetection detection, DefectAnalysis defect) {
            String defectType = "정상"; // 기본값은 정상으로 설정

            if (detection.getDetectionType() == 1 && defect != null) {
                defectType = mapEnumToType(defect.getAnalysisDetails());
            } else if (detection.getDetectionType() == 1 && defect == null) {
                defectType = "탐색 불가";
            }

            return RecordDto.builder()
                    .objectUrl(detection.getObjectUrl())
                    .detectionDate(detection.getCompletedAt())
                    .scannerSerialNumber(detection.getScanners().getSerialNumber())
                    .isDefective(detection.getDetectionType() == 1)
                    .defectType(defectType)
                    .confidenceRate(defect != null ? defect.getConfidence() : 100.0)
                    .build();
        }

        // 분석 결과 enum을 문자열로 변환
        private String mapEnumToType(AnalysisDetails details) {
            switch (details) {
                case deformation: return "변형";
                case rusting: return "녹";
                case scratches: return "스크래치";
                case fracture: return "균열";
                default: return "UNKNOWN";
            }
        }
    }
