//package com.ssafy.backend.domain.user.controller;
//
//import com.ssafy.backend.domain.user.model.service.UserService;
//import lombok.RequiredArgsConstructor;
//import org.springframework.http.ResponseEntity;
//import org.springframework.web.bind.annotation.*;
//
//@RestController
//@RequestMapping("/admin")
//@RequiredArgsConstructor
//public class AdminController {
//    private final UserService userService;
//
//    @PutMapping("/users/{email}/activate")
//    public ResponseEntity<String> activateUser(@PathVariable String email) {
//        userService.activateUser(email);
//
//        return ResponseEntity.ok(email + " 유저 활성화 완료");
//    }
//
//    @PutMapping("/users/{email}/deactivate")
//    public ResponseEntity<String> deactivateUser(@PathVariable String email) {
//        userService.deactivateUser(email);
//
//        return ResponseEntity.ok(email + " 유저 비홠성화 완료");
//    }
//
//    @DeleteMapping("/users/{email}")
//    public ResponseEntity<String> deleteUser(@PathVariable String email) {
//        userService.deleteUser(email);
//
//        return ResponseEntity.ok(email + " 유저 삭제 완료");
//    }
//}
