package com.minivault.util;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;

/**
 * Hibernate converter that automatically encrypts secret values before storing
 * in database and decrypts them when loading from database.
 *
 * Usage: Add @Convert(converter = SecretValueConverter.class) to entity field
 */
@Converter(autoApply = false)
@Slf4j
public class SecretValueConverter implements AttributeConverter<String, String> {

    private static EncryptionUtil encryptionUtil;

    /**
     * This setter is called by Spring to inject the EncryptionUtil bean
     */
    @Autowired
    public void setEncryptionUtil(EncryptionUtil encryptionUtil) {
        SecretValueConverter.encryptionUtil = encryptionUtil;
    }

    /**
     * Called when saving to database - converts entity attribute to database column
     * This encrypts the plain text value
     *
     * @param attribute The plain text secret value
     * @return Encrypted value to store in database
     */
    @Override
    public String convertToDatabaseColumn(String attribute) {
        if (attribute == null || attribute.isEmpty()) {
            return attribute;
        }

        try {
            String encrypted = encryptionUtil.encrypt(attribute);
            log.debug("Encrypted secret value for storage");
            return encrypted;
        } catch (Exception e) {
            log.error("Error encrypting secret value", e);
            throw new RuntimeException("Failed to encrypt secret value", e);
        }
    }

    /**
     * Called when loading from database - converts database column to entity attribute
     * This decrypts the encrypted value
     *
     * @param dbData The encrypted value from database
     * @return Decrypted plain text value
     */
    @Override
    public String convertToEntityAttribute(String dbData) {
        if (dbData == null || dbData.isEmpty()) {
            return dbData;
        }

        try {
            String decrypted = encryptionUtil.decrypt(dbData);
            log.debug("Decrypted secret value for entity");
            return decrypted;
        } catch (Exception e) {
            log.error("Error decrypting secret value", e);
            throw new RuntimeException("Failed to decrypt secret value", e);
        }
    }
}

