package com.minivault.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class LoginResponse {
    private Long id;
    private String email;
    private String name;
    private String message;
}
