package com.minivault.interfaces;

public interface AuditableRequest {
    /**
     * Return a short, human-readable name for descriptionTemplate
     * e.g., secret name, category name
     */
    String getAuditName();

    /**
     * Optional: return a resource ID to store in metadata
     */
    String getResourceId();

    /**
     * Optional: return extra structured data for metadata
     */
    default String getAuditMetadata() {
        return null;
    }
}
