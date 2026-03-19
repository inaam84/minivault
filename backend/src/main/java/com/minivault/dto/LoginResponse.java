package com.minivault.dto;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.minivault.model.Account;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class LoginResponse {
    private String email;
    private String name;
    private String token;
    private String message;

    @JsonIgnore
    private Account account;
}
