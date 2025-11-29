package com.minivault;

import jakarta.annotation.PostConstruct;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration;

@SpringBootApplication(exclude = {SecurityAutoConfiguration.class})
public class MinivaultBackendApplication {

    @PersistenceContext private EntityManager entityManager;

    public static void main(String[] args) {
        SpringApplication.run(MinivaultBackendApplication.class, args);
    }

    @PostConstruct
    public void testEntities() {
        System.out.println("🟢 Loaded entities:");
        entityManager
                .getMetamodel()
                .getEntities()
                .forEach(e -> System.out.println(" - " + e.getName()));
    }
}
