package com.minivault.service;

import com.minivault.dto.CreateCategoryRequest;
import com.minivault.dto.UpdateCategoryRequest;
import com.minivault.dto.UpdateSecretRequest;
import com.minivault.model.*;
import com.minivault.repository.*;
import java.util.Comparator;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class SecretService {
    private final SecretCategoryRepository categoryRepo;
    private final SecretRepository secretRepo;
    private final SecretVersionRepository versionRepo;

    @Transactional
    public SecretCategory createCategoryWithSecrets(
            Account account, CreateCategoryRequest request) {
        log.info("Creating category '{}' for account {}", request.getPath(), account.getId());

        // check if category exists
        SecretCategory existing =
                categoryRepo.findByPathAndAccountId(request.getPath(), account.getId());

        if (existing != null) {
            log.warn(
                    "Category '{}' already exists for account {}",
                    request.getPath(),
                    account.getId());
            throw new IllegalStateException("Category already exists");
        }

        // Create category
        SecretCategory category =
                SecretCategory.builder().path(request.getPath()).account(account).build();

        category = categoryRepo.save(category);

        log.info("Category saved with id {}", category.getId());

        // Save secrets
        for (CreateCategoryRequest.SecretItem item : request.getSecrets()) {

            log.info("Adding secret {} for category {}", item.getKey(), category.getId());

            Secret secret = Secret.builder()
                    .key(item.getKey())
                    .category(category)
                    .account(account)
                    .build();

            secret = secretRepo.save(secret);

            SecretVersion version = SecretVersion.builder()
                    .secret(secret)
                    .value(item.getValue())
                    .version(1)
                    .build();

            versionRepo.save(version);
        }

        log.info("All secrets saved for category {}", category.getId());

        return category;
    }

    @Transactional(readOnly = true)
    public List<SecretCategory> getAllCategoriesForAccount(Account account) {
        log.info("Fetching all categories for account {}", account.getId());
        return categoryRepo.findAll().stream()
                .filter(cat -> cat.getAccount().getId().equals(account.getId()))
                .toList();
    }

    @Transactional(readOnly = true)
    public SecretCategory getCategoryById(UUID categoryId, Account account) {
        log.info("Fetching category {} for account {}", categoryId, account.getId());

        SecretCategory category = categoryRepo.findById(categoryId)
                .orElseThrow(() -> new IllegalArgumentException("Category not found"));

        // Verify ownership
        if (!category.getAccount().getId().equals(account.getId())) {
            log.warn("Unauthorized access attempt to category {} by account {}",
                    categoryId, account.getId());
            throw new IllegalArgumentException("Unauthorized access to category");
        }

        return category;
    }

    @Transactional
    public SecretCategory updateCategory(
            UUID categoryId, Account account, UpdateCategoryRequest request) {
        log.info("Updating category {} for account {}", categoryId, account.getId());

        SecretCategory category = getCategoryById(categoryId, account);

        // Update path if different
        if (!category.getPath().equals(request.getPath())) {
            // Check if new path already exists
            SecretCategory existing =
                    categoryRepo.findByPathAndAccountId(request.getPath(), account.getId());
            if (existing != null) {
                throw new IllegalStateException("Category with this path already exists");
            }
            category.setPath(request.getPath());
        }

        // For each secret item, find or create Secret, and create new version
        for (UpdateCategoryRequest.SecretItem item : request.getSecrets()) {
            log.info("Adding/updating secret {} for category {}", item.getKey(), categoryId);

            Secret secret = category.getSecrets().stream()
                    .filter(s -> s.getKey().equals(item.getKey()))
                    .findFirst()
                    .orElse(null);

            if (secret == null) {
                secret = Secret.builder()
                        .key(item.getKey())
                        .category(category)
                        .account(account)
                        .build();
                secret = secretRepo.save(secret);
                category.getSecrets().add(secret);
            }

            // Get next version number
            int nextVersion = secret.getVersions() != null && !secret.getVersions().isEmpty()
                ? secret.getVersions().stream()
                    .mapToInt(SecretVersion::getVersion)
                    .max()
                    .orElse(0) + 1
                : 1;

            SecretVersion version = SecretVersion.builder()
                    .secret(secret)
                    .value(item.getValue())
                    .version(nextVersion)
                    .build();

            versionRepo.save(version);
        }

        SecretCategory updated = categoryRepo.save(category);
        log.info("Category {} updated successfully", categoryId);

        return updated;
    }

    @Transactional
    public void deleteCategoryById(UUID categoryId, Account account) {
        log.info("Deleting category {} for account {}", categoryId, account.getId());

        SecretCategory category = getCategoryById(categoryId, account);
        categoryRepo.delete(category);

        log.info("Category {} deleted successfully", categoryId);
    }

    @Transactional
    public void deleteSecretById(UUID secretId, Account account) {
        log.info("Deleting secret {} for account {}", secretId, account.getId());

        Secret secret = secretRepo.findById(secretId)
                .orElseThrow(() -> new IllegalArgumentException("Secret not found"));

        // Verify ownership
        if (!secret.getAccount().getId().equals(account.getId())) {
            log.warn("Unauthorized delete attempt on secret {} by account {}",
                    secretId, account.getId());
            throw new IllegalArgumentException("Unauthorized access to secret");
        }

        secretRepo.delete(secret);
        log.info("Secret {} deleted successfully", secretId);
    }

    @Transactional(readOnly = true)
    public Secret getSecretById(UUID secretId, Account account) {
        log.info("Fetching secret {} for account {}", secretId, account.getId());

        Secret secret = secretRepo.findById(secretId)
                .orElseThrow(() -> new IllegalArgumentException("Secret not found"));

        // Verify ownership
        if (!secret.getAccount().getId().equals(account.getId())) {
            log.warn("Unauthorized access attempt to secret {} by account {}",
                    secretId, account.getId());
            throw new IllegalArgumentException("Unauthorized access to secret");
        }

        return secret;
    }

    @Transactional
    public Secret updateSecret(UUID secretId, Account account, UpdateSecretRequest request) {
        log.info("Updating secret {} for account {}", secretId, account.getId());

        Secret secret = getSecretById(secretId, account);

        // Get next version number
        int nextVersion = secret.getVersions() != null && !secret.getVersions().isEmpty()
            ? secret.getVersions().stream()
                .mapToInt(SecretVersion::getVersion)
                .max()
                .orElse(0) + 1
            : 1;

        SecretVersion version = SecretVersion.builder()
                .secret(secret)
                .value(request.getValue())
                .version(nextVersion)
                .build();

        versionRepo.save(version);

        // keep entity graph consistent
        secret.getVersions().add(version);

        log.info("Secret {} updated to version {}", secretId, nextVersion);

        return secret;
    }
}
