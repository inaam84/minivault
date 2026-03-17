package com.minivault.dto;

import com.minivault.interfaces.AuditableRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import java.util.List;
import lombok.Data;

@Data
public class CreateCategoryRequest implements AuditableRequest {
    private String name;
    private String description;

    @Override
    public String getAuditName() {
        return name;
    }

    @Override
    public String getResourceId() {
        return null;
    }

    @Override
    public String getAuditMetadata() {
        return "{\"description\":\"" + description + "\"}";
    }

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
