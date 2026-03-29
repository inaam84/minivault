package com.minivault.dto;

import com.minivault.model.Team;
import lombok.Builder;
import lombok.Getter;

import java.time.Instant;
import java.util.UUID;

@Getter
@Builder
public class TeamResponse {
    private UUID id;
    private String name;
    private String description;
    private int memberCount;
    private Instant createdAt;

    public static TeamResponse from(Team team, int memberCount) {
        return TeamResponse.builder()
                .id(team.getId())
                .name(team.getName())
                .description(team.getDescription())
                .memberCount(memberCount)
                .createdAt(team.getCreatedAt())
                .build();
    }
}
