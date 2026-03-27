package com.minivault.dto;

import com.minivault.enums.OrgRole;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class InviteMemberRequest {
    @NotBlank
    @Email
    private String email;

    @NotNull
    private OrgRole role; // ADMIN or MEMBER
}
