package com.ssafy.backend.domain.user.controller;

import com.ssafy.backend.domain.user.dto.UserDto;
import com.ssafy.backend.domain.user.entity.User;
import com.ssafy.backend.domain.user.model.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/user")
@Tag(name = "유저 기능 API", description = "유저의 기능을 관리하는 API 입니다.")
public class UserController {
    private final UserService userService;

    @Operation(
            summary = "회원가입",
            description = "회원가입시 필요 정보 : 이메일, 비밀번호, 이름, 닉네임, 전화번호"
    )
    @PostMapping("/signup")
    public ResponseEntity<User> signup(@Valid @RequestBody UserDto userDto) {
        return ResponseEntity.ok(userService.signup(userDto));
    }

    @Operation(
            summary = "사용자 정보 조회",
            description = "현재 로그인한 사용자의 모든 정보 반환"
    )
    @GetMapping("/info")
    @PreAuthorize("hasAnyRole('USER','ADMIN')")
    public ResponseEntity<User> getMyUserInfo() {
        return ResponseEntity.ok(userService.getMyUserWithAuthorities().get());
    }
    
    @Operation(
            summary = "이메일 중복 확인",
            description = "이메일 입력시 중복 여부 반환 : true / false"
    )
    @GetMapping("/check-email")
    public ResponseEntity<Boolean> checkEmailDuplicate(@RequestParam String email) {
        boolean isDuplicate = userService.checkEmailDuplicate(email);
        return ResponseEntity.ok(isDuplicate);
    }

    @Operation(
            summary = "이메일 찾기",
            description = "이메일 찾기 필요 정보 : 전화번호 입력시 이메일 반환"
    )
    @GetMapping("/find-email")
    public ResponseEntity<String> findEmailByPhone(@RequestParam String phoneNumber) {
        String email = userService.findEmailByPhone(phoneNumber);
        if (email == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Email not found.");
        }
        return ResponseEntity.ok(email);
    }

    @Operation(
            summary = "비밀번호 찾기",
            description = "비밀번호찾기 필요 정보 : 이메일, 이름 입력시 비밀번호 반환"
    )
    @GetMapping("/find-password")
    public ResponseEntity<String> findPasswordByEmailAndName(@RequestParam String email, @RequestParam String name) {
        String password = userService.findPasswordByEmailAndName(email, name);
        if (password == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Password not found.");
        }
        return ResponseEntity.ok(password);
    }
}