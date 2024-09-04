package com.ssafy.backend.domain.connection.controller;

import com.ssafy.backend.domain.connection.entity.ImageEntity;
import com.ssafy.backend.domain.connection.model.service.ImageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.parameters.RequestBody;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/upload")
public class ConnectionController {

    private final ImageService imageService;

    @Autowired
    public ConnectionController(ImageService imageService) {
        this.imageService = imageService;
    }

    @Operation(
            summary = "이미지 메타데이터 업로드 (multipart/form-data)",
            description = "파일 이름, 파일 타입, 파일 URI를 multipart/form-data로 전송하여 저장합니다."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "업로드 성공"),
            @ApiResponse(responseCode = "500", description = "서버 오류 발생")
    })
    @PostMapping(consumes = "multipart/form-data")
    public ResponseEntity<ImageEntity> uploadImageMetadata(
            @RequestParam("fileName") String fileName,     // 파일 이름
            @RequestParam("fileType") String fileType,     // 파일 타입
            @RequestParam("fileUri") String fileUri        // 파일 URI
    ) {
        // 이미지 메타데이터 출력
        System.out.println("파일 이름: " + fileName);
        System.out.println("파일 타입: " + fileType);
        System.out.println("파일 URI: " + fileUri);

        // 이미지 메타데이터를 엔티티로 저장
        ImageEntity imageMetadata = new ImageEntity();
        imageMetadata.setFileName(fileName);
        imageMetadata.setFileType(fileType);
        imageMetadata.setFileUri(fileUri);

        // 데이터베이스에 저장
        ImageEntity savedImage = imageService.saveImageMetadata(imageMetadata);

        return ResponseEntity.ok(savedImage);
    }
}
