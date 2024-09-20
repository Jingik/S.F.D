package com.ssafy.backend.domain.user.dto;

import lombok.*;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class TokenDto {

    private String accessToken;  // Access Token
    private String refreshToken; // Refresh Token
}
