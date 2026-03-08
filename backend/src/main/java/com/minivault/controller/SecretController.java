package com.minivault.controller;

import com.minivault.dto.*;
import com.minivault.model.Account;
import com.minivault.model.Secret;
import com.minivault.model.SecretCategory;
import com.minivault.service.AuthService;
import com.minivault.service.SecretService;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/secrets")
@RequiredArgsConstructor
@Slf4j
public class SecretController {
    private final SecretService secretService;
    private final AuthService authService;

    @PostMapping("/category")
    public ResponseEntity<?> createCategory(@Valid @RequestBody CreateCategoryRequest request) {
        log.info("Incoming createCategory request: {}", request);

        // Get authenticated account
        Account account = authService.getAuthenticatedAccount();

        SecretCategory category = secretService.createCategoryWithSecrets(account, request);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(SecretCategoryResponse.fromEntity(category)));
    }

    @GetMapping
    public ResponseEntity<?> getAllCategories() {
        log.info("Incoming getAllCategories request");

        Account account = authService.getAuthenticatedAccount();

        List<SecretCategory> categories = secretService.getAllCategoriesForAccount(account);
        List<SecretCategoryResponse> responses =
                categories.stream().map(SecretCategoryResponse::fromEntity).toList();

        return ResponseEntity.ok(ApiResponse.success(responses));
    }

    @GetMapping("/{categoryId}")
    public ResponseEntity<?> getCategory(@PathVariable UUID categoryId) {
        log.info("Incoming getCategory request for categoryId: {}", categoryId);

        Account account = authService.getAuthenticatedAccount();
        SecretCategory category = secretService.getCategoryById(categoryId, account);

        return ResponseEntity.ok(ApiResponse.success(SecretCategoryResponse.fromEntity(category)));
    }

    @PutMapping("/{categoryId}")
    public ResponseEntity<?> updateCategory(
            @PathVariable UUID categoryId, @Valid @RequestBody UpdateCategoryRequest request) {
        log.info("Incoming updateCategory request for categoryId: {}", categoryId);

        Account account = authService.getAuthenticatedAccount();
        SecretCategory category = secretService.updateCategory(categoryId, account, request);

        return ResponseEntity.ok(ApiResponse.success(SecretCategoryResponse.fromEntity(category)));
    }

    @DeleteMapping("/{categoryId}")
    public ResponseEntity<?> deleteCategory(@PathVariable UUID categoryId) {
        log.info("Incoming deleteCategory request for categoryId: {}", categoryId);

        Account account = authService.getAuthenticatedAccount();
        secretService.deleteCategoryById(categoryId, account);

        return ResponseEntity.ok(ApiResponse.success("Category deleted successfully"));
    }

    @GetMapping("/secret/{secretId}")
    public ResponseEntity<?> getSecret(@PathVariable UUID secretId) {
        log.info("Incoming getSecret request for secretId: {}", secretId);

        Account account = authService.getAuthenticatedAccount();
        Secret secret = secretService.getSecretById(secretId, account);

        return ResponseEntity.ok(ApiResponse.success(SecretResponse.fromEntity(secret)));
    }

    @PutMapping("/secret/{secretId}")
    public ResponseEntity<?> updateSecret(
            @PathVariable UUID secretId, @Valid @RequestBody UpdateSecretRequest request) {
        log.info("Incoming updateSecret request for secretId: {}", secretId);

        Account account = authService.getAuthenticatedAccount();
        Secret secret = secretService.updateSecret(secretId, account, request);

        return ResponseEntity.ok(ApiResponse.success(SecretResponse.fromEntity(secret)));
    }

    @DeleteMapping("/secret/{secretId}")
    public ResponseEntity<?> deleteSecret(@PathVariable UUID secretId) {
        log.info("Incoming deleteSecret request for secretId: {}", secretId);

        Account account = authService.getAuthenticatedAccount();
        secretService.deleteSecretById(secretId, account);

        return ResponseEntity.ok(ApiResponse.success("Secret deleted successfully"));
    }
}
