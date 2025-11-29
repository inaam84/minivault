package com.minivault.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor // generates constructor with all fields
@NoArgsConstructor // generates default constructor
public class SignupResponse {
    private String email;
    private String name;
    private String token;
}
