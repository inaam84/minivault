package com.minivault.util;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import lombok.extern.slf4j.Slf4j;

/**
 * Hibernate AttributeConverter for encrypted secret fields.
 *
 * Uses EncryptionUtilHolder (static singleton) instead of autowiring EncryptionUtil directly.
 * This works because Hibernate converters are not Spring-managed beans.
 *
 * Usage in entity:
 * @Convert(converter = SecretValueConverter.class)
 * private String apiSecret;
 */
@Converter
@Slf4j
public class SecretValueConverter implements AttributeConverter<String, String> {

    /**
     * Convert entity attribute (plaintext) to database column (encrypted).
     * Called before INSERT/UPDATE.
     */
    @Override
    public String convertToDatabaseColumn(String attribute) {
        // NULL values stay NULL in database
        if (attribute == null) {
            return null;
        }

        try {
            return EncryptionUtilHolder.encrypt(attribute);
        } catch (IllegalArgumentException e) {
            // Empty string or validation error
            log.warn("Cannot encrypt empty or invalid secret value: {}", e.getMessage());
            return null;
        } catch (EncryptionUtil.EncryptionException e) {
            // Encryption operation failed
            log.error("Error encrypting secret value", e);
            throw new RuntimeException("Failed to encrypt secret for storage", e);
        }
    }

    /**
     * Convert database column (encrypted) to entity attribute (plaintext).
     * Called when loading entity from database.
     */
    @Override
    public String convertToEntityAttribute(String dbData) {
        // NULL in database means null in entity
        if (dbData == null) {
            return null;
        }

        try {
            return EncryptionUtilHolder.decrypt(dbData);
        } catch (IllegalArgumentException e) {
            // Malformed Base64 or empty ciphertext
            log.error("Decryption failed: invalid encrypted data format: {}", e.getMessage());
            throw new RuntimeException("Corrupted encrypted secret in database", e);
        } catch (EncryptionUtil.DecryptionException e) {
            // Authentication tag failed (tampering, corruption, or wrong key)
            log.error("Decryption authentication failed — secret data may be corrupted or encryption key is wrong", e);
            throw new RuntimeException("Authentication failed: unable to decrypt stored secret", e);
        }
    }
}