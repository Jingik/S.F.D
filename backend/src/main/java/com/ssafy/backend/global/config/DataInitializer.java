package com.ssafy.backend.global.config;

import com.ssafy.backend.domain.user.entity.Authority;
import com.ssafy.backend.domain.user.model.repository.AuthorityRepository;
import com.ssafy.backend.domain.user.model.repository.AuthorityRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    private final AuthorityRepository authorityRepository;

    public DataInitializer(AuthorityRepository authorityRepository) {
        this.authorityRepository = authorityRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        if (authorityRepository.findById("ROLE_USER").isEmpty()) {
            authorityRepository.save(new Authority("ROLE_USER"));
        }
        if (authorityRepository.findById("ROLE_ADMIN").isEmpty()) {
            authorityRepository.save(new Authority("ROLE_ADMIN"));
        }
    }
}
