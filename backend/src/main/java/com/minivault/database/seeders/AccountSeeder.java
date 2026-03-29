package com.minivault.database.seeders;

import com.minivault.database.factory.AccountFactory;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@RequiredArgsConstructor
@Slf4j
@Profile({"dev", "local", "test"})
public class AccountSeeder implements CommandLineRunner {

    private final AccountFactory accountFactory;
    private final Environment env;

    @Override
    @Transactional
    public void run(String... args) {
        log.info("=== Running AccountSeeder ===");

        if (accountFactory.getRepository().count() > 0) {
            log.info("Accounts already exist. Skipping.");
            return;
        }

        int count = env.getProperty("app.seeding.accounts-count", Integer.class, 5);

        accountFactory.create(count);

        accountFactory.state("verified").create(count);

        accountFactory
                .with("email", "custom@test.com")
                .state("admin")
                .create();

        log.info("Successfully seeded accounts. Total count: {}", accountFactory.getRepository().count());
    }
}