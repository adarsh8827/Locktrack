package com.excisemia;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing
public class ExciseMiaApplication {
    public static void main(String[] args) {
        SpringApplication.run(ExciseMiaApplication.class, args);
    }
}