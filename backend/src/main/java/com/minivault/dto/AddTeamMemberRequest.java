package com.minivault.dto;

import com.minivault.enums.TeamRole;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class AddTeamMemberRequest {
    @NotNull
    private UUID accountId;

    @NotNull
    private TeamRole role; // LEAD or MEMBER
}
