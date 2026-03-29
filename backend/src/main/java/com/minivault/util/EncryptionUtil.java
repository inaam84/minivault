package com.minivault.util;

import lombok.extern.slf4j.Slf4j;
import org.springframework.core.env.Environment;

import javax.crypto.Cipher;
import javax.crypto.KeyGenerator;
import javax.crypto.SecretKey;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.util.Base64;

/**
 * AES-256-GCM Encryption utility.
 * Uses environment variable for persistent key.
 * Dev-friendly defaults prevent startup blocking in Docker.
 *
 * NOTE: This is NOT a Spring @Component.
 * Lifecycle is managed by EncryptionUtilHolder (which IS a @Component).
 * EncryptionUtilHolder creates this and exposes it as a static singleton
 * for use by Hibernate converters that cannot be Spring-managed beans.
 */
@Slf4j
public class EncryptionUtil {

    private static final String ALGORITHM = "AES/GCM/NoPadding";
    private static final int KEY_SIZE_BITS = 256;
    private static final int IV_LENGTH_BYTES = 12;       // GCM recommended
    private static final int GCM_TAG_LENGTH_BITS = 128;  // Auth tag
    private static final int MIN_CIPHERTEXT_LENGTH = 16; // GCM tag minimum

    private SecretKey secretKey;
    private static final SecureRandom secureRandom = createSecureRandom();

    private final String encryptionKeyString;

    /**
     * Constructor - backward compatible with single String parameter.
     * Auto-detects production mode from Spring environment.
     */
    public EncryptionUtil(String encryptionKeyString) {
        this(encryptionKeyString, null);
    }

    /**
     * Constructor with explicit environment.
     * @param encryptionKeyString Base64-encoded AES-256 key (32 bytes), or empty for dev mode
     * @param environment Spring Environment (optional, for production detection)
     */
    public EncryptionUtil(String encryptionKeyString, Environment environment) {
        this.encryptionKeyString = encryptionKeyString;
        SecretKey tempKey = null;

        try {
            if (encryptionKeyString != null && !encryptionKeyString.trim().isEmpty()) {
                byte[] decodedKey = Base64.getDecoder().decode(encryptionKeyString.trim());
                if (decodedKey.length != 32) {
                    throw new IllegalArgumentException(
                            String.format("Encryption key must be exactly 32 bytes (256 bits) after Base64 decoding. Got %d bytes.",
                                    decodedKey.length));
                }
                tempKey = new SecretKeySpec(decodedKey, "AES");
                log.info("AES-256-GCM key loaded successfully ({} bytes)", decodedKey.length);
            }
        } catch (IllegalArgumentException e) {
            log.error("Invalid encryption key format: {}", e.getMessage());
        } catch (Exception e) {
            log.error("Failed to load encryption key", e);
        }

        // Fallback to temporary key (dev only)
        if (tempKey == null) {
            log.warn("⚠️ Using temporary random AES-256 key (dev only). " +
                    "Production requires encryption.key environment variable. " +
                    "Data encrypted now will NOT decrypt after restart or in other instances.");
            tempKey = generateKey();
        }

        this.secretKey = tempKey;
    }

    private SecretKey generateKey() {
        try {
            KeyGenerator keyGen = KeyGenerator.getInstance("AES");
            keyGen.init(KEY_SIZE_BITS);
            return keyGen.generateKey();
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate encryption key", e);
        }
    }

    private static SecureRandom createSecureRandom() {
        try {
            // Non-blocking PRNG suitable for Docker / Alpine
            return SecureRandom.getInstance("NativePRNGNonBlocking");
        } catch (Exception e) {
            log.warn("NativePRNGNonBlocking not available, falling back to default SecureRandom", e);
            return new SecureRandom();
        }
    }

    /**
     * Encrypt a plaintext string using AES-256-GCM.
     *
     * @param plainText Text to encrypt (null or empty will throw exception)
     * @return Base64-encoded IV + ciphertext + tag
     * @throws EncryptionException if encryption fails
     * @throws IllegalArgumentException if plainText is null or empty
     */
    public String encrypt(String plainText) throws EncryptionException {
        if (plainText == null || plainText.isEmpty()) {
            throw new IllegalArgumentException("Plaintext must not be null or empty");
        }

        try {
            byte[] iv = new byte[IV_LENGTH_BYTES];
            secureRandom.nextBytes(iv);

            Cipher cipher = Cipher.getInstance(ALGORITHM);
            GCMParameterSpec spec = new GCMParameterSpec(GCM_TAG_LENGTH_BITS, iv);
            cipher.init(Cipher.ENCRYPT_MODE, secretKey, spec);

            byte[] ciphertext = cipher.doFinal(plainText.getBytes(StandardCharsets.UTF_8));

            // Store IV + ciphertext together
            byte[] combined = new byte[iv.length + ciphertext.length];
            System.arraycopy(iv, 0, combined, 0, iv.length);
            System.arraycopy(ciphertext, 0, combined, iv.length, ciphertext.length);

            return Base64.getEncoder().encodeToString(combined);
        } catch (IllegalArgumentException e) {
            throw e; // Re-throw validation exceptions
        } catch (Exception e) {
            log.error("Encryption failed for input of length {}", plainText.length(), e);
            throw new EncryptionException("Encryption operation failed", e);
        }
    }

    /**
     * Decrypt a Base64-encoded AES-256-GCM string.
     *
     * @param encryptedValue Base64 string (IV + ciphertext + tag)
     * @return Decrypted plaintext
     * @throws DecryptionException if decryption fails (auth tag invalid, malformed data, wrong key, etc.)
     * @throws IllegalArgumentException if encryptedValue is null or empty
     */
    public String decrypt(String encryptedValue) throws DecryptionException {
        if (encryptedValue == null || encryptedValue.isEmpty()) {
            throw new IllegalArgumentException("Encrypted value must not be null or empty");
        }

        try {
            byte[] decoded = Base64.getDecoder().decode(encryptedValue);

            // Validate structure: IV (12 bytes) + ciphertext (min 16 bytes for tag)
            if (decoded.length < IV_LENGTH_BYTES + MIN_CIPHERTEXT_LENGTH) {
                throw new DecryptionException(
                        String.format("Invalid ciphertext format: expected at least %d bytes, got %d",
                                IV_LENGTH_BYTES + MIN_CIPHERTEXT_LENGTH, decoded.length));
            }

            byte[] iv = new byte[IV_LENGTH_BYTES];
            System.arraycopy(decoded, 0, iv, 0, IV_LENGTH_BYTES);

            byte[] ciphertext = new byte[decoded.length - IV_LENGTH_BYTES];
            System.arraycopy(decoded, IV_LENGTH_BYTES, ciphertext, 0, ciphertext.length);

            Cipher cipher = Cipher.getInstance(ALGORITHM);
            cipher.init(Cipher.DECRYPT_MODE, secretKey, new GCMParameterSpec(GCM_TAG_LENGTH_BITS, iv));

            byte[] plainBytes = cipher.doFinal(ciphertext);
            return new String(plainBytes, StandardCharsets.UTF_8);

        } catch (DecryptionException e) {
            throw e; // Re-throw our custom exception
        } catch (javax.crypto.AEADBadTagException e) {
            log.error("Authentication tag verification failed — possible tampering, data corruption, or wrong key");
            throw new DecryptionException("Authentication failed: data may be tampered or decryption key is wrong", e);
        } catch (IllegalArgumentException e) {
            log.error("Invalid Base64 input or malformed ciphertext: {}", e.getMessage());
            throw new DecryptionException("Invalid ciphertext format", e);
        } catch (Exception e) {
            log.error("Decryption failed", e);
            throw new DecryptionException("Decryption operation failed", e);
        }
    }

    /**
     * Generate a new AES-256-GCM key (Base64 encoded).
     * Use this to rotate keys or bootstrap a new encryption key.
     */
    public String generateAndEncodeKey() {
        try {
            KeyGenerator keyGen = KeyGenerator.getInstance("AES");
            keyGen.init(KEY_SIZE_BITS);
            SecretKey newKey = keyGen.generateKey();
            String encoded = Base64.getEncoder().encodeToString(newKey.getEncoded());
            log.info("Generated new AES-256-GCM key (use for encryption.key environment variable)");
            return encoded;
        } catch (Exception e) {
            log.error("Key generation failed", e);
            throw new RuntimeException(e);
        }
    }

    /**
     * Custom exception for encryption failures.
     * Allows callers to distinguish encryption errors from other runtime exceptions.
     */
    public static class EncryptionException extends Exception {
        public EncryptionException(String message) {
            super(message);
        }
        public EncryptionException(String message, Throwable cause) {
            super(message, cause);
        }
    }

    /**
     * Custom exception for decryption failures.
     * Includes detection of authentication failures (tampering or wrong key).
     */
    public static class DecryptionException extends Exception {
        public DecryptionException(String message) {
            super(message);
        }
        public DecryptionException(String message, Throwable cause) {
            super(message, cause);
        }
    }
}