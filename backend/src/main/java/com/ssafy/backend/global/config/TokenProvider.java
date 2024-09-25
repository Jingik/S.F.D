package com.ssafy.backend.global.config;

import com.ssafy.backend.domain.user.dto.TokenDto;
import com.ssafy.backend.domain.user.entity.Authority;
import com.ssafy.backend.domain.user.entity.User;
import com.ssafy.backend.domain.user.model.repository.UserRepository;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.security.SecureRandom;
import java.util.Arrays;
import java.util.Collection;
import java.util.Date;
import java.util.Set;
import java.util.stream.Collectors;

@Component
public class TokenProvider {

    private static final String AUTHORITIES_KEY = "auth";
    private final Logger logger = LoggerFactory.getLogger(TokenProvider.class);
    private final long accessTokenValidityInMilliseconds;
    private final long refreshTokenValidityInMilliseconds;
    private final UserRepository userRepository;
    private Key key;

    public TokenProvider(
            @Value("${jwt.access-token-validity-in-seconds}") long accessTokenValidityInSeconds,
            @Value("${jwt.refresh-token-validity-in-seconds}") long refreshTokenValidityInSeconds,
            UserRepository userRepository) {
        this.accessTokenValidityInMilliseconds = accessTokenValidityInSeconds * 1000; // 1시간
        this.refreshTokenValidityInMilliseconds = refreshTokenValidityInSeconds * 1000; // 24시간
        this.userRepository = userRepository;

        // 매번 서버가 시작될 때마다 랜덤한 키 생성
        generateRandomKey();
    }

    private void generateRandomKey() {
        byte[] keyBytes = new byte[64]; // 512비트 키 생성
        new SecureRandom().nextBytes(keyBytes);
        this.key = Keys.hmacShaKeyFor(keyBytes);
        logger.info("랜덤 Secret Key 생성 완료.");
    }

    // 공통 토큰 생성 로직 (Access & Refresh 토큰)
    private String createToken(String subject, Collection<? extends GrantedAuthority> authorities, long validityPeriod) {
        String authoritiesStr = authorities != null
                ? authorities.stream().map(GrantedAuthority::getAuthority).collect(Collectors.joining(","))
                : null;

        JwtBuilder jwtBuilder = Jwts.builder()
                .setSubject(subject)
                .signWith(key, SignatureAlgorithm.HS512)
                .setExpiration(new Date((new Date()).getTime() + validityPeriod));

        // 권한이 있을 경우 Claim에 추가
        if (authoritiesStr != null) {
            jwtBuilder.claim(AUTHORITIES_KEY, authoritiesStr);
        }

        return jwtBuilder.compact();
    }

    // Access Token 생성
    public String createAccessToken(Authentication authentication) {
        return createToken(authentication.getName(), authentication.getAuthorities(), accessTokenValidityInMilliseconds);
    }

    // Refresh Token 생성
    public String createRefreshToken(String email) {
        return createToken(email, null, refreshTokenValidityInMilliseconds);
    }

    // Access Token과 Refresh Token 묶어서 반환
    public TokenDto createTokens(Authentication authentication) {
        String accessToken = createAccessToken(authentication);
        String refreshToken = createRefreshToken(authentication.getName());

        // Refresh Token을 저장
        saveRefreshToken(authentication.getName(), refreshToken);

        return new TokenDto(accessToken, refreshToken);
    }

    // 토큰 파싱 및 검증 로직
    private Claims parseToken(String token) {
        try {
            return Jwts.parserBuilder()
                    .setSigningKey(key)
                    .build()
                    .parseClaimsJws(token)
                    .getBody();
        } catch (JwtException e) {
            logger.warn("JWT 토큰 오류: {}", e.getMessage());
            throw new IllegalArgumentException("유효하지 않은 JWT 토큰입니다.", e);
        }
    }

    // 토큰 유효성 검증
    public boolean validateToken(String token) {
        try {
            parseToken(token);
            return true;
        } catch (IllegalArgumentException e) {
            return false;
        }
    }

    // Authentication 객체 생성 (토큰에서 사용자 정보와 권한 추출)
    public Authentication getAuthentication(String token) {
        Claims claims = parseToken(token);

        // 권한을 GrantedAuthority로 변환
        Collection<? extends GrantedAuthority> authorities = Arrays.stream(claims.get(AUTHORITIES_KEY).toString().split(","))
                .map(SimpleGrantedAuthority::new)
                .collect(Collectors.toList());

        // User 생성 및 권한 설정
        User user = new User();
        user.setEmail(claims.getSubject());
        user.setAuthorities(authorities.stream()
                .map(auth -> new Authority(auth.getAuthority()))
                .collect(Collectors.toSet()));

        return new UsernamePasswordAuthenticationToken(user, token, authorities);
    }

    // Refresh Token으로 새로운 Access Token 및 Refresh Token 발급
    public TokenDto refreshTokens(String refreshToken) {
        Claims claims = parseToken(refreshToken);
        String email = claims.getSubject();

        // 사용자 정보를 조회
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        // 새로운 Access Token 발급
        String newAccessToken = createAccessToken(new UsernamePasswordAuthenticationToken(user, null, user.getAuthorities()));
        String newRefreshToken = createRefreshToken(email);

        // 새로 발급된 Refresh Token 저장
        saveRefreshToken(email, newRefreshToken);

        // SecurityContext에 인증 정보 설정
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(user, null, user.getAuthorities()));

        return new TokenDto(newAccessToken, newRefreshToken);
    }

    // Refresh Token 저장 메서드
    private void saveRefreshToken(String email, String refreshToken) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));
        user.setRefreshToken(refreshToken);
        userRepository.save(user); // 변경사항 저장
    }
}
