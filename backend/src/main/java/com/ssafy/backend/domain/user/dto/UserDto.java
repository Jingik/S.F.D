package com.ssafy.backend.domain.user.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

// JSON의 순서를 결정하는 DTO [입력 표시되는 영역 결정]
// 클라이언트의 정보를 받아오는 영역 / 노출되어도 상관 없는 정보
@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UserDto {

    @NotBlank
    @Size(min = 3, max = 100)
    private String email;

    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    @NotBlank
    @Size(min = 3, max = 100)
    private String password;

    @NotBlank
    @Size(max = 100)
    private String name;

    @NotBlank
    @Size(min = 3, max = 100)
    private String nickname;

    @NotBlank
    @Size(min = 10, max = 15)
    private String phoneNumber;
}
