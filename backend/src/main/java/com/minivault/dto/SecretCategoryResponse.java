package com.minivault.dto;

import com.minivault.model.SecretCategory;
import java.time.Instant;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class SecretCategoryResponse {
    private Long id;
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
        private Long id;
        private String key;
        private String value;
        private Instant createdAt;
        private Instant updatedAt;

        public static SecretItemResponse fromEntity(com.minivault.model.VaultSecret secret) {
            return SecretItemResponse.builder()
                    .id(secret.getId())
                    .key(secret.getKey())
                    .value(secret.getValue())
                    .createdAt(secret.getCreatedAt())
                    .updatedAt(secret.getUpdatedAt())
                    .build();
        }
    }
}

