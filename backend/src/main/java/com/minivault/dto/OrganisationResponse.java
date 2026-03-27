package com.minivault.dto;

import com.minivault.model.Organisation;
import lombok.Builder;
import lombok.Getter;

import java.time.Instant;
import java.util.UUID;

@Getter
@Builder
public class OrganisationResponse {
    private UUID id;
    private String name;
    private String slug;
    private String ownerEmail;
    private int memberCount;
    private int teamCount;
    private Instant createdAt;

    public static OrganisationResponse from(Organisation org, int memberCount, int teamCount) {
        return OrganisationResponse.builder()
                .id(org.getId())
                .name(org.getName())
                .slug(org.getSlug())
                .ownerEmail(org.getOwner().getEmail())
                .memberCount(memberCount)
                .teamCount(teamCount)
                .createdAt(org.getCreatedAt())
                .build();
    }
}
