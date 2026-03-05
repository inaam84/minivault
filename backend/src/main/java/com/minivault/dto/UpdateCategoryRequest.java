package com.minivault.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UpdateCategoryRequest {
    @NotBlank(message = "Path is required")
    private String path;

    @NotEmpty(message = "At least one secret is required")
    @Valid
    private List<SecretItem> secrets;

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class SecretItem {
        private Long id; // null if new secret, set if updating existing

        @NotBlank(message = "Secret key is required")
        private String key;

        @NotBlank(message = "Secret value is required")
        private String value;
    }
}

