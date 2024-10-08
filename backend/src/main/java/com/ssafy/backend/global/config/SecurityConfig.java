package com.ssafy.backend.global.config;

import com.ssafy.backend.global.exception.JwtAccessDeniedHandler;
import com.ssafy.backend.global.exception.JwtAuthenticationEntryPoint;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableGlobalMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
@EnableGlobalMethodSecurity(prePostEnabled = true)
public class SecurityConfig {

    private final TokenProvider tokenProvider;
    private final JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint;
    private final JwtAccessDeniedHandler jwtAccessDeniedHandler;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity httpSecurity) throws Exception {
        JwtFilter jwtFilter = new JwtFilter(tokenProvider);

        httpSecurity
                // CSRF 비활성화
                .csrf(csrf -> csrf.disable())
                // 예외 처리
                .exceptionHandling(exceptionHandling -> exceptionHandling
                        .authenticationEntryPoint(jwtAuthenticationEntryPoint)
                        .accessDeniedHandler(jwtAccessDeniedHandler)
                )
                // 세션 정책 설정
                .sessionManagement(sessionManagement -> sessionManagement
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )
                // CORS 설정
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                // 요청들에 대한 접근 제한 설정
                .authorizeHttpRequests(authorizeRequests -> authorizeRequests
                        // Swagger 허용 경로 설정
                        .requestMatchers("/swagger-ui/**", "/api/v3/api-docs/**", "/swagger-resources/**", "/swagger-ui.html").permitAll()
                        // 로그인, 회원가입 허용
                        .requestMatchers("/api/auth/login", "/api/user/signup", "/api/user/find-password", "/api/user/find-email", "/api/user/check-email").permitAll()
                        .requestMatchers("/api/scanners/**", "/api/object-detections/**", "/api/defect-analysis/**").permitAll()
                        // 가장 최신의 정보 가져오기 허용
                        .requestMatchers("/api/records/latest").permitAll()
                        // 나머지 요청은 인증 필요
                        .anyRequest().authenticated()
                )
                // JwtFilter를 추가
                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return httpSecurity.build();
    }

    // CORS 설정
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(List.of(
                "http://localhost:3000",
                "https://localhost:3000",
                "http://j11B103.p.ssafy.io",
                "https://j11B103.p.ssafy.io"
        )); // 패턴으로 허용할 도메인들
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("Authorization", "Cache-Control", "Content-Type"));
        configuration.setAllowCredentials(true); // allowCredentials는 true
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
