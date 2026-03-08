package com.minivault.dto;

import com.minivault.model.Secret;
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
public class SecretResponse {
    private UUID id;
    private String key;
    private String value;
    private Instant createdAt;
    private Instant updatedAt;
    private int currentVersion;
    private List<VersionInfo> versions;

    public static SecretResponse fromEntity(Secret secret) {
        SecretVersion latest =
                secret.getVersions() != null && !secret.getVersions().isEmpty()
                        ? secret.getVersions().stream()
                                .max(Comparator.comparing(SecretVersion::getCreatedAt))
                                .orElse(null)
                        : null;

        List<VersionInfo> versionInfos =
                secret.getVersions() != null
                        ? secret.getVersions().stream()
                                .map(
                                        v ->
                                                new VersionInfo(
                                                        v.getId(),
                                                        v.getVersion(),
                                                        v.getCreatedAt()))
                                .sorted(Comparator.comparing(VersionInfo::getCreatedAt).reversed())
                                .toList()
                        : List.of();

        return SecretResponse.builder()
                .id(secret.getId())
                .key(secret.getKey())
                .value(latest != null ? latest.getValue() : null)
                .createdAt(secret.getCreatedAt())
                .updatedAt(latest != null ? latest.getCreatedAt() : null)
                .currentVersion(latest != null ? latest.getVersion() : 0)
                .versions(versionInfos)
                .build();
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @Builder
    public static class VersionInfo {
        private UUID versionId;
        private int version;
        private Instant createdAt;
    }
}
