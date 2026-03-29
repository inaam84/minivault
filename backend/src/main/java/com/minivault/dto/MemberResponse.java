package com.minivault.dto;

import com.minivault.enums.OrgRole;
import com.minivault.model.OrganisationMember;
import lombok.Builder;
import lombok.Getter;

import java.time.Instant;
import java.util.UUID;

@Getter
@Builder
public class MemberResponse {
    private UUID accountId;
    private String name;
    private String email;
    private OrgRole role;
    private Instant joinedAt;

    public static MemberResponse from(OrganisationMember member) {
        return MemberResponse.builder()
                .accountId(member.getAccount().getId())
                .name(member.getAccount().getName())
                .email(member.getAccount().getEmail())
                .role(member.getRole())
                .joinedAt(member.getJoinedAt())
                .build();
    }
}
