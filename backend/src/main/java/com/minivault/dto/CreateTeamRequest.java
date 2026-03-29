package com.minivault.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class CreateTeamRequest {
    @NotBlank
    @Size(min = 2, max = 100)
    private String name;

    private String description;
}
