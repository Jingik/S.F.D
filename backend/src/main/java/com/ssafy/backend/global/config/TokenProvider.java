package com.ssafy.backend.global.config;

import com.ssafy.backend.domain.user.dto.TokenDto;
import com.ssafy.backend.domain.user.entity.Authority;
import com.ssafy.backend.domain.user.entity.User;
import com.ssafy.backend.domain.user.model.repository.UserRepository;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.InitializingBean;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.security.SecureRandom;
import java.util.Arrays;
import java.util.Collection;
import java.util.Date;
import java.util.stream.Collectors;

@Component
public class TokenProvider implements InitializingBean {

    private static final String AUTHORITIES_KEY = "auth";
    private final Logger logger = LoggerFactory.getLogger(TokenProvider.class);
    private final long accessTokenValidityInMilliseconds;
    private final long refreshTokenValidityInMilliseconds;
    private Key key;

    private final UserRepository userRepository;

    public TokenProvider(
            @Value("${jwt.access-token-validity-in-seconds}") long accessTokenValidityInSeconds,
            @Value("${jwt.refresh-token-validity-in-seconds}") long refreshTokenValidityInSeconds,
            UserRepository userRepository) {
        this.accessTokenValidityInMilliseconds = accessTokenValidityInSeconds * 1000;
        this.refreshTokenValidityInMilliseconds = refreshTokenValidityInSeconds * 10000;
        this.userRepository = userRepository;
    }

    @Override
    public void afterPropertiesSet() {
        byte[] keyBytes = new byte[64];
        new SecureRandom().nextBytes(keyBytes);
        this.key = Keys.hmacShaKeyFor(keyBytes);
        logger.info("Generated Secret Key: {}", io.jsonwebtoken.io.Encoders.BASE64.encode(keyBytes));
    }

    // Access Token 생성 메서드
    public String createAccessToken(Authentication authentication) {
        String authorities = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.joining(","));

        long now = new Date().getTime();
        Date validity = new Date(now + this.accessTokenValidityInMilliseconds);

        return buildToken(authentication.getName(), authorities, validity);
    }

    // Refresh Token 생성 메서드
    public String createRefreshToken(String email) {
        long now = new Date().getTime();
        Date validity = new Date(now + this.refreshTokenValidityInMilliseconds);

        String refreshToken = buildToken(email, null, validity);
        saveRefreshToken(email, refreshToken); // Refresh Token 저장
        return refreshToken;
    }

    // 토큰 생성 공통 로직
    private String buildToken(String subject, String authorities, Date validity) {
        JwtBuilder jwtBuilder = Jwts.builder()
                .setSubject(subject)
                .signWith(key, SignatureAlgorithm.HS512)
                .setExpiration(validity);

        if (authorities != null) {
            jwtBuilder.claim(AUTHORITIES_KEY, authorities);
        }

        return jwtBuilder.compact();
    }

    // Access Token과 Refresh Token을 묶어서 반환하는 메서드
    public TokenDto createTokens(Authentication authentication) {
        String accessToken = createAccessToken(authentication);
        String refreshToken = createRefreshToken(authentication.getName());
        return new TokenDto(accessToken, refreshToken);
    }

    // 토큰 검증 및 파싱 메서드
    private Claims parseToken(String token) {
        try {
            return Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token).getBody();
        } catch (JwtException e) {
            logger.warn("잘못된 JWT 토큰입니다: {}", e.getMessage());
            throw new IllegalArgumentException("유효하지 않은 JWT 토큰입니다.", e);
        }
    }

    // Authentication 객체 생성 메서드
    public Authentication getAuthentication(String token) {
        Claims claims = parseToken(token);

        Collection<? extends GrantedAuthority> authorities =
                Arrays.stream(claims.get(AUTHORITIES_KEY).toString().split(","))
                        .map(SimpleGrantedAuthority::new)
                        .collect(Collectors.toList());

        User user = new User();
        user.setEmail(claims.getSubject());
        user.setAuthorities(authorities.stream()
                .map(auth -> new Authority(auth.getAuthority()))
                .collect(Collectors.toSet()));

        return new UsernamePasswordAuthenticationToken(user, token, authorities);
    }

    // 토큰 검증 메서드
    public boolean validateToken(String token) {
        try {
            parseToken(token); // 토큰 파싱이 성공하면 유효한 토큰
            return true;
        } catch (IllegalArgumentException e) {
            return false;
        }
    }

    // Refresh Token을 이용해 새로운 Access Token & Refresh Token 발급 메서드
    public TokenDto refreshTokens(String refreshToken) {
        Claims claims = parseToken(refreshToken);
        String email = claims.getSubject();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("사용자가 존재하지 않습니다."));

        // 새로운 Access Token 발급
        String newAccessToken = createAccessToken(new UsernamePasswordAuthenticationToken(user, null, user.getAuthorities()));

        // Refresh Token도 갱신
        String newRefreshToken = createRefreshToken(email);

        // 새로운 Access Token과 Refresh Token 반환
        return new TokenDto(newAccessToken, newRefreshToken);
    }

    // Refresh Token을 DB에 저장하는 메서드
    private void saveRefreshToken(String email, String refreshToken) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("사용자가 존재하지 않습니다."));
        user.setRefreshToken(refreshToken);
        userRepository.save(user);
    }
}
