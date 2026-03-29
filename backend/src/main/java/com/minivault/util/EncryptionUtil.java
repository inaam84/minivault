package com.minivault.util;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.Cipher;
import javax.crypto.KeyGenerator;
import javax.crypto.SecretKey;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.util.Base64;

/**
 * Secure Encryption utility using AES-256-GCM.
 * Provides authenticated encryption (confidentiality + integrity).
 */
@Component
@Slf4j
public class EncryptionUtil {

    private static final String ALGORITHM = "AES/GCM/NoPadding";
    private static final int KEY_SIZE_BITS = 256;
    private static final int IV_LENGTH_BYTES = 12;      // Recommended for GCM
    private static final int GCM_TAG_LENGTH_BITS = 128; // Authentication tag

    private final SecretKey secretKey;
    private static final SecureRandom secureRandom = createSecureRandom();
    private static SecureRandom createSecureRandom() {
        try {
            return SecureRandom.getInstanceStrong();
        } catch (Exception e) {
            log.warn("Strong SecureRandom not available, falling back to default", e);
            return new SecureRandom();
        }
    }

    /**
     * Constructor injects the encryption key from property `encryption.key` (Base64-encoded).
     * The key must be exactly 32 bytes (256 bits) after Base64 decoding.
     */
    public EncryptionUtil(@Value("${encryption.key:}") String encryptionKeyString) {
        try {
            if (encryptionKeyString != null && !encryptionKeyString.trim().isEmpty()) {
                byte[] decodedKey = Base64.getDecoder().decode(encryptionKeyString.trim());

                if (decodedKey.length != 32) {
                    throw new IllegalArgumentException(
                            "Encryption key must be exactly 32 bytes (256 bits) after Base64 decoding. " +
                                    "Provided length: " + decodedKey.length + " bytes. " +
                                    "Use generateAndEncodeKey() to create a valid key.");
                }

                this.secretKey = new SecretKeySpec(decodedKey, "AES");
                log.info("Secure AES-256-GCM key loaded successfully ({} bytes)", decodedKey.length);
            } else {
                // In production: never generate here — require explicit key via env var / secrets manager
                this.secretKey = generateKey();
                log.warn("No encryption.key provided. Generated a temporary random key. " +
                        "This is ONLY for development. Set a persistent key in production!");
            }
        } catch (Exception e) {
            log.error("Failed to initialize encryption key", e);
            throw new RuntimeException("Encryption key initialization failed", e);
        }
    }

    private SecretKey generateKey() throws Exception {
        KeyGenerator keyGenerator = KeyGenerator.getInstance("AES");
        keyGenerator.init(KEY_SIZE_BITS);
        return keyGenerator.generateKey();
    }

    /**
     * Encrypts plain text and returns Base64-encoded result in format: Base64(IV + ciphertext)
     */
    public String encrypt(String plainValue) {
        if (plainValue == null || plainValue.isEmpty()) {
            return plainValue;
        }

        try {
            byte[] iv = new byte[IV_LENGTH_BYTES];
            secureRandom.nextBytes(iv);

            Cipher cipher = Cipher.getInstance(ALGORITHM);
            GCMParameterSpec gcmSpec = new GCMParameterSpec(GCM_TAG_LENGTH_BITS, iv);
            cipher.init(Cipher.ENCRYPT_MODE, secretKey, gcmSpec);

            byte[] plaintextBytes = plainValue.getBytes(StandardCharsets.UTF_8);
            byte[] ciphertext = cipher.doFinal(plaintextBytes);

            // Combine IV + ciphertext (includes auth tag)
            byte[] encryptedWithIv = new byte[iv.length + ciphertext.length];
            System.arraycopy(iv, 0, encryptedWithIv, 0, iv.length);
            System.arraycopy(ciphertext, 0, encryptedWithIv, iv.length, ciphertext.length);

            return Base64.getEncoder().encodeToString(encryptedWithIv);
        } catch (Exception e) {
            log.error("Encryption failed", e);
            throw new RuntimeException("Encryption failed", e);
        }
    }

    /**
     * Decrypts Base64-encoded value that was produced by encrypt()
     */
    public String decrypt(String encryptedValue) {
        if (encryptedValue == null || encryptedValue.isEmpty()) {
            return encryptedValue;
        }

        try {
            byte[] decoded = Base64.getDecoder().decode(encryptedValue);

            if (decoded.length < IV_LENGTH_BYTES + 16) { // Minimum size check
                throw new IllegalArgumentException("Invalid encrypted data format");
            }

            // Extract IV (first 12 bytes)
            byte[] iv = new byte[IV_LENGTH_BYTES];
            System.arraycopy(decoded, 0, iv, 0, IV_LENGTH_BYTES);

            // Remaining bytes = ciphertext + tag
            byte[] ciphertext = new byte[decoded.length - IV_LENGTH_BYTES];
            System.arraycopy(decoded, IV_LENGTH_BYTES, ciphertext, 0, ciphertext.length);

            Cipher cipher = Cipher.getInstance(ALGORITHM);
            GCMParameterSpec gcmSpec = new GCMParameterSpec(GCM_TAG_LENGTH_BITS, iv);
            cipher.init(Cipher.DECRYPT_MODE, secretKey, gcmSpec);

            byte[] decryptedBytes = cipher.doFinal(ciphertext);
            return new String(decryptedBytes, StandardCharsets.UTF_8);
        } catch (Exception e) {
            log.error("Decryption failed (possible wrong key or tampered data)", e);
            throw new RuntimeException("Decryption failed", e);
        }
    }

    /**
     * Generates a new valid Base64-encoded 256-bit key.
     * Call this once (e.g., in a main method or dev tool) and set it as encryption.key
     */
    public String generateAndEncodeKey() {
        try {
            SecretKey newKey = generateKey();
            String encoded = Base64.getEncoder().encodeToString(newKey.getEncoded());
            log.info("New secure 256-bit key generated: {}", encoded);
            return encoded;
        } catch (Exception e) {
            log.error("Key generation failed", e);
            throw new RuntimeException("Failed to generate key", e);
        }
    }
}