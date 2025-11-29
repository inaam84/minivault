package com.minivault.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
@PasswordMatches
public class SignupRequest {

  @NotBlank(message = "Name is required")
  @Size(min = 6, max = 70, message = "Name must be 6-70 characters long")
  private String name;

  @NotBlank(message = "Email is required")
  @Email(message = "Must be a valid email")
  private String email;

  @NotBlank(message = "Password is required")
  @Size(min = 8, max = 64, message = "Password must be between 8 and 64 characters")
  private String password;

  @NotBlank(message = "Confirm password is required")
  private String confirmPassword;
}
