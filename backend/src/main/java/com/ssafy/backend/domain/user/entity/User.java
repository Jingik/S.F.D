package com.ssafy.backend.domain.user.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.Set;
import java.util.stream.Collectors;

@Entity
@Table(name = "users") // DB의 테이블과 매핑
@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class User implements UserDetails {  // UserDetails 인터페이스 구현

    @JsonIgnore
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "email", length = 100, unique = true)
    private String email;

    @JsonIgnore
    @Column(name = "password", length = 100)
    private String password;

    @Column(name = "name", length = 50)
    private String name;

    @Column(name = "nickname", length = 100)
    private String nickname;

    @NotBlank
    @Size(min = 10, max = 15) // Validation for phone number (length restrictions)
    @Column(name = "phone_number", length = 15, unique = true) // New phoneNumber field
    private String phoneNumber; // Added phone number field

    @JsonIgnore
    @Column(name = "activated")
    private boolean activated;

    // Refresh Token 필드
    @JsonIgnore
    @Column(name = "refresh_token", length = 512)
    private String refreshToken;

    // User와 Authority의 ManyToMany 관계 매핑
    @ManyToMany
    @JoinTable(
            name = "user_authority",
            joinColumns = {@JoinColumn(name = "user_id", referencedColumnName = "id")},
            inverseJoinColumns = {@JoinColumn(name = "authority_name", referencedColumnName = "authority_name")})
    private Set<Authority> authorities;

    // UserDetails 인터페이스 구현 메서드들
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        // authorities 컬렉션을 GrantedAuthority로 변환
        return this.authorities.stream()
                .map(authority -> new SimpleGrantedAuthority(authority.getAuthorityName()))  // Authority의 이름을 SimpleGrantedAuthority로 변환
                .collect(Collectors.toSet());
    }

    @Override
    public String getUsername() {
        return this.email;  // 이메일을 사용자의 식별자로 사용
    }

    @Override
    public String getPassword() {
        return this.password;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;  // 계정 만료 여부
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;  // 계정 잠금 여부
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;  // 자격 증명 만료 여부
    }

    @Override
    public boolean isEnabled() {
        return this.activated;  // 계정 활성화 여부
    }
}
