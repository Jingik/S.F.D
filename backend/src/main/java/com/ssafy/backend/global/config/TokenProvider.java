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

    private final UserRepository userRepository;  // 사용자 정보 저장을 위한 UserRepository

    public TokenProvider(
            @Value("${jwt.access-token-validity-in-seconds}") long accessTokenValidityInSeconds,
            @Value("${jwt.refresh-token-validity-in-seconds}") long refreshTokenValidityInSeconds,
            UserRepository userRepository) {
        this.accessTokenValidityInMilliseconds = accessTokenValidityInSeconds * 1000;
        this.refreshTokenValidityInMilliseconds = refreshTokenValidityInSeconds * 1000;
        this.userRepository = userRepository;
    }

    @Override
    public void afterPropertiesSet() {
        byte[] keyBytes = new byte[64];
        SecureRandom secureRandom = new SecureRandom();
        secureRandom.nextBytes(keyBytes);

        this.key = Keys.hmacShaKeyFor(keyBytes);

        logger.info("Generated Secret Key: " + io.jsonwebtoken.io.Encoders.BASE64.encode(keyBytes));
    }

    // Access Token 생성 메서드
    public String createAccessToken(Authentication authentication) {
        String authorities = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.joining(","));

        long now = (new Date()).getTime();
        Date validity = new Date(now + this.accessTokenValidityInMilliseconds);

        return Jwts.builder()
                .setSubject(authentication.getName())
                .claim(AUTHORITIES_KEY, authorities)
                .signWith(key, SignatureAlgorithm.HS512)
                .setExpiration(validity)
                .compact();
    }

    // Refresh Token 생성 메서드
    public String createRefreshToken(String email) {
        long now = (new Date()).getTime();
        Date validity = new Date(now + this.refreshTokenValidityInMilliseconds);

        String refreshToken = Jwts.builder()
                .setSubject(email)  // 이메일을 subject로 설정
                .setExpiration(validity)
                .signWith(key, SignatureAlgorithm.HS512)
                .compact();

        // Refresh Token 저장
        saveRefreshToken(email, refreshToken);

        return refreshToken;
    }

    // Refresh Token을 DB에 저장하는 메서드
    private void saveRefreshToken(String email, String refreshToken) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("사용자가 존재하지 않습니다."));

        user.setRefreshToken(refreshToken);  // 사용자 엔티티에 Refresh Token 저장
        userRepository.save(user);  // 저장
    }

    // Access Token과 Refresh Token을 묶어서 반환하는 메서드
    public TokenDto createTokens(Authentication authentication) {
        String accessToken = createAccessToken(authentication);
        String refreshToken = createRefreshToken(authentication.getName());  // 이메일을 이용해 Refresh Token 생성

        // Access Token과 Refresh Token을 포함한 DTO 반환
        return new TokenDto(accessToken, refreshToken);
    }

    public Authentication getAuthentication(String token) {
        Claims claims = Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody();

        // 권한을 추출하여 Authentication 생성
        Collection<? extends GrantedAuthority> authorities =
                Arrays.stream(claims.get(AUTHORITIES_KEY).toString().split(","))
                        .map(SimpleGrantedAuthority::new)
                        .collect(Collectors.toList());

        // User 엔티티 생성
        User user = new User();
        user.setEmail(claims.getSubject());
        user.setAuthorities(authorities.stream()
                .map(auth -> new Authority(auth.getAuthority()))
                .collect(Collectors.toSet()));

        return new UsernamePasswordAuthenticationToken(user, token, authorities);
    }

    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token);
            return true;
        } catch (io.jsonwebtoken.security.SecurityException | MalformedJwtException e) {
            logger.info("잘못된 JWT 서명입니다.");
        } catch (ExpiredJwtException e) {
            logger.info("만료된 JWT 토큰입니다.");
        } catch (UnsupportedJwtException e) {
            logger.info("지원되지 않는 JWT 토큰입니다.");
        } catch (IllegalArgumentException e) {
            logger.info("JWT 토큰이 잘못되었습니다.");
        }
        return false;
    }

    // Refresh Token을 이용해 새로운 Access Token을 발급하는 메서드
    public String refreshAccessToken(String refreshToken) {
        try {
            // Refresh Token 검증
            Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(refreshToken);

            // Refresh Token이 유효하면 새로운 Access Token 발급
            String email = Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(refreshToken).getBody().getSubject();
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new IllegalArgumentException("사용자가 존재하지 않습니다."));

            return createAccessToken(new UsernamePasswordAuthenticationToken(user, null, user.getAuthorities()));
        } catch (JwtException e) {
            throw new IllegalArgumentException("잘못된 Refresh Token입니다.", e);
        }
    }
}