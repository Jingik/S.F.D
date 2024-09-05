package com.ssafy.backend.domain.user.controller;

import com.ssafy.backend.domain.user.dto.AuthResponse;
import com.ssafy.backend.domain.user.dto.LoginRequest;
import com.ssafy.backend.domain.user.dto.SignupRequest;
import com.ssafy.backend.domain.user.entity.User;
import com.ssafy.backend.global.config.JwtTokenProvider;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.ssafy.backend.domain.user.model.repository.UserRepository;
import org.springframework.web.bind.annotation.RequestBody;


import java.util.List;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;
    private final UserRepository usersRepository;

    public AuthController(AuthenticationManager authenticationManager, JwtTokenProvider jwtTokenProvider, UserRepository usersRepository) {
        this.authenticationManager = authenticationManager;
        this.jwtTokenProvider = jwtTokenProvider;
        this.usersRepository = usersRepository;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String token = jwtTokenProvider.createToken(authentication.getName(), ((User) authentication.getPrincipal()).getRoles());

        return ResponseEntity.ok(new AuthResponse(token));
    }

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody SignupRequest signupRequest) {
        if (usersRepository.existsByEmail(signupRequest.getEmail())) {
            return ResponseEntity.badRequest().body("Email already exists");
        }

        User user = new User(signupRequest.getEmail(), signupRequest.getPassword(), signupRequest.getPhoneNum(), List.of("ROLE_USER"));
        usersRepository.save(user);

        return ResponseEntity.ok("User registered successfully");
    }
}
