package com.ssafy.backend.domain.scanner.service;

import com.ssafy.backend.domain.scanner.entity.Scanners;
import com.ssafy.backend.domain.scanner.repository.ScannersRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;

@Service
@RequiredArgsConstructor
public class ScannersService {

    private final ScannersRepository scannersRepository;

    // WebSocket 세션을 관리하는 리스트
    private final CopyOnWriteArrayList<WebSocketSession> sessions = new CopyOnWriteArrayList<>();

    public List<Scanners> getScannersByUserId(Long userId) {
        return scannersRepository.findByUserId(userId);
    }

    // 스캐너 사용 여부를 업데이트하는 메서드
    public Scanners updateScannerUsage(Long serialNumber, boolean isUsing) {
        Scanners scanner = findBySerialNumber(serialNumber);
        if (scanner != null) {
            scanner.setIsUsing(isUsing);
            if (!isUsing) {
                scanner.setCompletedAt(LocalDateTime.now());
            }
            return saveScanner(scanner);
        }
        return null;
    }

    // 시리얼 넘버로 스캐너를 조회하는 메서드
    public Scanners findBySerialNumber(Long serialNumber) {
        return scannersRepository.findBySerialNumber(serialNumber).orElse(null);
    }

    // 스캐너 정보를 저장하는 메서드
    public Scanners saveScanner(Scanners scanner) {
        // 여기서 스캐너 정보를 데이터베이스에 저장하는 로직
        return scannersRepository.save(scanner);
    }

    // 비디오 스트리밍 시작
    public void startVideoStream(Long serialNumber) {
        String videoData = "실시간 비디오 스트림 데이터 (시리얼 넘버: " + serialNumber + ")";
        sessions.forEach(session -> {
            try {
                session.sendMessage(new TextMessage(videoData));
            } catch (IOException e) {
                e.printStackTrace();
            }
        });
    }

    // 비디오 스트리밍 종료
    public void stopVideoStream(Long serialNumber) {
        String stopMessage = "촬영 종료 (시리얼 넘버: " + serialNumber + ")";
        sessions.forEach(session -> {
            try {
                session.sendMessage(new TextMessage(stopMessage));
            } catch (IOException e) {
                e.printStackTrace();
            }
        });
    }

    // 새로운 WebSocket 연결을 세션에 추가
    public void registerSession(WebSocketSession session) {
        sessions.add(session);
    }

    // WebSocket 세션에서 연결 해제
    public void removeSession(WebSocketSession session) {
        sessions.remove(session);
    }
}
