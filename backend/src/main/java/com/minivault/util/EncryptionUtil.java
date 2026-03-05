package com.minivault.util;

import javax.crypto.Cipher;
import javax.crypto.KeyGenerator;
import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import java.util.Base64;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/**
 * Encryption utility for encrypting and decrypting secret values.
 * Uses AES encryption algorithm for security.
 */
@Component
@Slf4j
public class EncryptionUtil {

    private static final String ENCRYPTION_ALGORITHM = "AES";
    private static final int KEY_SIZE = 256; // 256-bit key
    private SecretKey secretKey;

    /**
     * Initialize encryption key from environment variable or generate a new one
     */
    public EncryptionUtil(@Value("${encryption.key:}") String encryptionKeyString) {
        try {
            if (encryptionKeyString != null && !encryptionKeyString.isEmpty()) {
                // Load key from environment variable (Base64 encoded)
                byte[] decodedKey = Base64.getDecoder().decode(encryptionKeyString);
                this.secretKey =
                        new SecretKeySpec(
                                decodedKey, 0, decodedKey.length, 0, ENCRYPTION_ALGORITHM);
                log.info("Encryption key loaded from environment variable");
            } else {
                // Generate a new random key if not provided
                this.secretKey = generateKey();
                log.warn(
                        "No encryption key provided. Generated a new random key. "
                                + "Set encryption.key environment variable for persistence.");
            }
        } catch (Exception e) {
            log.error("Error initializing encryption key", e);
            throw new RuntimeException("Failed to initialize encryption key", e);
        }
    }

    /**
     * Generate a new random encryption key
     */
    private SecretKey generateKey() throws Exception {
        KeyGenerator keyGenerator = KeyGenerator.getInstance(ENCRYPTION_ALGORITHM);
        keyGenerator.init(KEY_SIZE);
        return keyGenerator.generateKey();
    }

    /**
     * Encrypt a plain text value
     *
     * @param plainValue The plain text value to encrypt
     * @return Base64 encoded encrypted value
     */
    public String encrypt(String plainValue) {
        if (plainValue == null || plainValue.isEmpty()) {
            return plainValue;
        }

        try {
            Cipher cipher = Cipher.getInstance(ENCRYPTION_ALGORITHM);
            cipher.init(Cipher.ENCRYPT_MODE, secretKey);
            byte[] encryptedBytes = cipher.doFinal(plainValue.getBytes());
            return Base64.getEncoder().encodeToString(encryptedBytes);
        } catch (Exception e) {
            log.error("Error encrypting value", e);
            throw new RuntimeException("Encryption failed", e);
        }
    }

    /**
     * Decrypt an encrypted value
     *
     * @param encryptedValue The Base64 encoded encrypted value
     * @return Decrypted plain text value
     */
    public String decrypt(String encryptedValue) {
        if (encryptedValue == null || encryptedValue.isEmpty()) {
            return encryptedValue;
        }

        try {
            Cipher cipher = Cipher.getInstance(ENCRYPTION_ALGORITHM);
            cipher.init(Cipher.DECRYPT_MODE, secretKey);
            byte[] decodedBytes = Base64.getDecoder().decode(encryptedValue);
            byte[] decryptedBytes = cipher.doFinal(decodedBytes);
            return new String(decryptedBytes);
        } catch (Exception e) {
            log.error("Error decrypting value", e);
            throw new RuntimeException("Decryption failed", e);
        }
    }

    /**
     * Generate and print a new encryption key for configuration
     * Call this once to generate a key, then set it in environment variables
     */
    public String generateAndEncodeKey() {
        try {
            SecretKey newKey = generateKey();
            String encodedKey = Base64.getEncoder().encodeToString(newKey.getEncoded());
            log.info("Generated new encryption key: {}", encodedKey);
            return encodedKey;
        } catch (Exception e) {
            log.error("Error generating key", e);
            throw new RuntimeException("Failed to generate key", e);
        }
    }
}

