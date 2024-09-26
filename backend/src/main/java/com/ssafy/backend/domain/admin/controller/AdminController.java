package com.ssafy.backend.domain.admin.controller;

import com.ssafy.backend.domain.admin.model.service.AdminService;
import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
public class AdminController {
    private final AdminService adminService;

    @Operation(
            summary = "유저 서비스 활성화",
            description = "이메일로 유저의 서비스 활성여부 결정"
    )
    @PreAuthorize("hasAnyRole('ADMIN')")
    @PutMapping("/users/{email}/activate")
    public ResponseEntity<String> activateUser(@PathVariable String email) {
        adminService.activateUser(email);

        return ResponseEntity.ok(email + " 유저 활성화 완료");
    }

    @Operation(
            summary = "유저 서비스 비활성화",
            description = "이메일로 유저의 서비스 활성여부 결정"
    )
    @PreAuthorize("hasAnyRole('ADMIN')")
    @PutMapping("/users/{email}/deactivate")
    public ResponseEntity<String> deactivateUser(@PathVariable String email) {
        adminService.deactivateUser(email);

        return ResponseEntity.ok(email + " 유저 비홠성화 완료");
    }

    @Operation(
            summary = "유저 계정 삭제",
            description = "이메일로 해당 유저의 정보 삭제"
    )
    @PreAuthorize("hasAnyRole('ADMIN')")
    @DeleteMapping("/users/{email}")
    public ResponseEntity<String> deleteUser(@PathVariable String email) {
        adminService.deleteUser(email);

        return ResponseEntity.ok(email + " 유저 삭제 완료");
    }

    @Operation(
            summary = "유저 권한 설정",
            description = "이메일로 유저의 권한 업데이트"
    )
    @PreAuthorize("hasAnyRole('ADMIN')")
    @PutMapping("/users/{email}/role")
    public ResponseEntity<String> updateRole(@PathVariable String email, @RequestBody String role) {
        adminService.updateUserRole(email, role.toUpperCase());
        return ResponseEntity.ok(email + " 유저 역할 변경 완료");
    }
}