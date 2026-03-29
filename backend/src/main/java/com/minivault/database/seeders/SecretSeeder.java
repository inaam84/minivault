package com.minivault.database.seeders;

import com.minivault.database.factory.SecretCategoryFactory;
import com.minivault.database.factory.SecretFactory;
import com.minivault.database.factory.SecretVersionFactory;
import com.minivault.model.Account;
import com.minivault.model.Secret;
import com.minivault.model.SecretCategory;
import com.minivault.repository.AccountRepository;
import com.minivault.repository.SecretCategoryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.core.annotation.Order;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
@Profile({"dev", "local", "test"})
@Order(2) // ← runs after AccountSeeder (Order 1)
public class SecretSeeder implements CommandLineRunner {

    private final SecretCategoryFactory categoryFactory;
    private final SecretFactory secretFactory;
    private final SecretVersionFactory versionFactory;
    private final AccountRepository accountRepository;
    private final SecretCategoryRepository categoryRepository;
    private final Environment env;

    @Override
    @Transactional
    public void run(String... args) {
        log.info("=== Running SecretSeeder ===");

        if (categoryRepository.count() > 0) {
            log.info("Secret categories already exist. Skipping.");
            return;
        }

        List<Account> accounts = accountRepository.findAll();

        if (accounts.isEmpty()) {
            log.warn("No accounts found. Run AccountSeeder first.");
            return;
        }

        int categoriesPerAccount = env.getProperty(
                "app.seeding.categories-per-account", Integer.class, 3);
        int secretsPerCategory = env.getProperty(
                "app.seeding.secrets-per-category", Integer.class, 4);

        int totalCategories = 0;
        int totalSecrets    = 0;
        int totalVersions   = 0;

        for (Account account : accounts) {

            // ── Production categories (explicit paths)
            SecretCategory prodDb = categoryFactory
                    .forAccount(account)
                    .state("production")
                    .with("path", "production/database")
                    .create();

            SecretCategory prodApi = categoryFactory
                    .forAccount(account)
                    .state("production")
                    .with("path", "production/api-keys")
                    .create();

            // ── Staging + personal (random from state)
            List<SecretCategory> extraCategories = categoryFactory
                    .forAccount(account)
                    .state("staging")
                    .create(categoriesPerAccount - 2);

            totalCategories += 2 + extraCategories.size();

            // ── Seed secrets for each category
            for (SecretCategory category : List.of(prodDb, prodApi)) {
                totalSecrets  += seedSecretsForCategory(account, category, secretsPerCategory);
                totalVersions += seedVersions(account, category);
            }

            for (SecretCategory category : extraCategories) {
                totalSecrets  += seedSecretsForCategory(account, category, secretsPerCategory);
                totalVersions += seedVersions(account, category);
            }
        }

        log.info("SecretSeeder complete — {} categories, {} secrets, {} versions across {} accounts",
                totalCategories, totalSecrets, totalVersions, accounts.size());
    }

    // ─────────────────────────────────────────
    // Seed secrets for a category
    // ─────────────────────────────────────────
    private int seedSecretsForCategory(Account account, SecretCategory category, int count) {
        List<Secret> secrets = secretFactory
                .forAccount(account)
                .forCategory(category)
                .create(count);

        // One secret with multiple versions to test version history
        secretFactory
                .forAccount(account)
                .forCategory(category)
                .state("versioned")
                .create();

        return secrets.size() + 1;
    }

    // ─────────────────────────────────────────
    // Seed versions for all secrets in a category
    // ─────────────────────────────────────────
    private int seedVersions(Account account, SecretCategory category) {
        List<Secret> secrets = secretFactory.getRepository()
                .findAll()
                .stream()
                .filter(s -> s.getCategory().getId().equals(category.getId()))
                .toList();

        int count = 0;

        for (Secret secret : secrets) {
            // Always create version 1
            versionFactory
                    .forSecret(secret)
                    .withVersion(1)
                    .create();
            count++;

            // If secret has multiple versions, create them too
            if (secret.getCurrentVersion() > 1) {
                for (int v = 2; v <= secret.getCurrentVersion(); v++) {
                    versionFactory
                            .forSecret(secret)
                            .withVersion(v)
                            .state("rotated")
                            .create();
                    count++;
                }
            }
        }

        return count;
    }
}