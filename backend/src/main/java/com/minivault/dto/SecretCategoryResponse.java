package com.minivault.dto;

import com.minivault.model.Secret;
import com.minivault.model.SecretCategory;
import com.minivault.model.SecretVersion;
import java.time.Instant;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class SecretCategoryResponse {
    private UUID id;
    private String path;
    private List<SecretItemResponse> secrets;
    private Instant createdAt;
    private Instant updatedAt;

    public static SecretCategoryResponse fromEntity(SecretCategory category) {
        return SecretCategoryResponse.builder()
                .id(category.getId())
                .path(category.getPath())
                .secrets(
                        category.getSecrets() != null
                                ? category.getSecrets().stream()
                                        .map(SecretItemResponse::fromEntity)
                                        .toList()
                                : List.of())
                .createdAt(category.getCreatedAt())
                .updatedAt(category.getUpdatedAt())
                .build();
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @Builder
    public static class SecretItemResponse {
        private UUID id;
        private String key;
        private String value;
        private Instant createdAt;
        private Instant updatedAt;

        public static SecretItemResponse fromEntity(Secret secret) {
            SecretVersion latest = secret.getVersions() != null && !secret.getVersions().isEmpty()
                ? secret.getVersions().stream()
                    .max(Comparator.comparing(SecretVersion::getCreatedAt))
                    .orElse(null)
                : null;
            return SecretItemResponse.builder()
                    .id(secret.getId())
                    .key(secret.getKey())
                    .value(latest != null ? latest.getValue() : null)
                    .createdAt(secret.getCreatedAt())
                    .updatedAt(latest != null ? latest.getCreatedAt() : null)
                    .build();
        }
    }
}
