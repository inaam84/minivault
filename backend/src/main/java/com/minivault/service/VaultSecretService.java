package com.minivault.service;

import com.minivault.dto.CreateCategoryRequest;
import com.minivault.dto.UpdateCategoryRequest;
import com.minivault.model.*;
import com.minivault.repository.*;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class VaultSecretService {
    private final SecretCategoryRepository categoryRepo;
    private final VaultSecretRepository secretRepo;

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

            VaultSecret secret =
                    VaultSecret.builder()
                            .key(item.getKey())
                            .value(item.getValue())
                            .category(category)
                            .account(account)
                            .build();

            secretRepo.save(secret);
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
    public SecretCategory getCategoryById(Long categoryId, Account account) {
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
            Long categoryId, Account account, UpdateCategoryRequest request) {
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

        // Clear existing secrets and add new ones
        category.getSecrets().clear();

        for (UpdateCategoryRequest.SecretItem item : request.getSecrets()) {
            log.info("Adding/updating secret {} for category {}", item.getKey(), categoryId);

            VaultSecret secret = VaultSecret.builder()
                    .key(item.getKey())
                    .value(item.getValue())
                    .category(category)
                    .account(account)
                    .build();

            category.getSecrets().add(secret);
        }

        SecretCategory updated = categoryRepo.save(category);
        log.info("Category {} updated successfully", categoryId);

        return updated;
    }

    @Transactional
    public void deleteCategoryById(Long categoryId, Account account) {
        log.info("Deleting category {} for account {}", categoryId, account.getId());

        SecretCategory category = getCategoryById(categoryId, account);
        categoryRepo.delete(category);

        log.info("Category {} deleted successfully", categoryId);
    }

    @Transactional
    public void deleteSecretById(Long secretId, Account account) {
        log.info("Deleting secret {} for account {}", secretId, account.getId());

        VaultSecret secret = secretRepo.findById(secretId)
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
}
