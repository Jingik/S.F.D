package com.ssafy.backend.domain.user.controller;

import com.ssafy.backend.domain.user.dto.LoginDto;
import com.ssafy.backend.domain.user.dto.TokenDto;
import com.ssafy.backend.global.config.JwtFilter;
import com.ssafy.backend.global.config.TokenProvider;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/user")
@RequiredArgsConstructor
public class AuthController {
    private final TokenProvider tokenProvider;
    private final AuthenticationManagerBuilder authenticationManagerBuilder;

    @PostMapping("/login")
    public ResponseEntity<TokenDto> authorize(@Valid @RequestBody LoginDto loginDto) {
        // UsernamePasswordAuthenticationToken 생성
        UsernamePasswordAuthenticationToken authenticationToken =
                new UsernamePasswordAuthenticationToken(loginDto.getEmail(), loginDto.getPassword());

        // Authentication 객체 생성 및 SecurityContextHolder에 설정
        Authentication authentication = authenticationManagerBuilder.getObject().authenticate(authenticationToken);
        SecurityContextHolder.getContext().setAuthentication(authentication);

        // Access Token과 Refresh Token 생성
        TokenDto tokenDto = tokenProvider.createTokens(authentication);

        // 헤더에 Access Token 추가
        HttpHeaders httpHeaders = new HttpHeaders();
        httpHeaders.add(JwtFilter.AUTHORIZATION_HEADER, "Bearer " + tokenDto.getAccessToken());

        // 응답으로 토큰과 헤더 전송
        return new ResponseEntity<>(tokenDto, httpHeaders, HttpStatus.OK);
    }

    @PostMapping("/refresh")
    public ResponseEntity<TokenDto> refreshAccessToken(@RequestBody String refreshToken) {
        // TokenProvider의 refreshTokens 메서드를 사용하여 새로운 Access Token과 Refresh Token 생성
        TokenDto tokenDto = tokenProvider.refreshTokens(refreshToken);

        // 새로운 Access Token과 Refresh Token을 담은 TokenDto 반환
        return new ResponseEntity<>(tokenDto, HttpStatus.OK);
    }
}