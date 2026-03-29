package com.minivault.database.seeders;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.core.env.Environment;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@RequiredArgsConstructor
@Slf4j
@Profile({"dev", "local", "test"})
@Order(10)
public class DatabaseSeeder implements CommandLineRunner {

    private final AccountSeeder accountSeeder;
    private final Environment env;

    @Override
    @Transactional
    public void run(String... args) {
        log.info("🚀 Starting Database Seeding ...");

        boolean seedingEnabled = env.getProperty("app.seeding.enabled", Boolean.class, true);
        if (!seedingEnabled) {
            log.info("Database seeding is disabled. Skipping.");
            return;
        }

        try {
            accountSeeder.run(args);
            log.info("✅ Database Seeding completed successfully!");
        } catch (Exception e) {
            log.error("❌ Database seeding failed", e);
        }
    }
}