package com.ssafy.backend.domain.user.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.util.Set;

@Entity
@Table(name = "users") // DB의 테이블과 매핑
@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class User {

    @JsonIgnore
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id; // primary key로 자동 증가

    @Column(name = "email", length = 100, unique = true)
    private String email;

    @JsonIgnore
    @Column(name = "password", length = 100)
    private String password;

    @Column(name = "name", length = 50) // 사람 이름을 저장하는 필드 추가
    private String name;

    @Column(name = "nickname", length = 50)
    private String nickname;

    @JsonIgnore
    @Column(name = "activated")
    private boolean activated;

    // User와 Authority의 ManyToMany 관계 매핑
    @ManyToMany
    @JoinTable(
            name = "user_authority", // 매핑 테이블 이름
            joinColumns = {@JoinColumn(name = "user_id", referencedColumnName = "id")}, // User의 id를 참조
            inverseJoinColumns = {@JoinColumn(name = "authority_name", referencedColumnName = "authority_name")}) // Authority의 authority_name 참조
    private Set<Authority> authorities;
}
