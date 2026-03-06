package com.minivault.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import java.util.List;
import lombok.Data;

@Data
public class CreateCategoryRequest {
    @NotBlank(message = "Path is required")
    private String path;

    @NotEmpty(message = "At least one secret is required")
    @Valid
    private List<SecretItem> secrets;

    @Data
    public static class SecretItem {
        @NotBlank(message = "Secret key is required")
        private String key;

        @NotBlank(message = "Secret value is required")
        private String value;
    }
}
