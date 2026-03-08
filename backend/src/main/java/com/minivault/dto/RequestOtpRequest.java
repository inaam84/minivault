package com.minivault.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class RequestOtpRequest {

    @Email @NotBlank private String email;
}
