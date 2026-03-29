package com.minivault.util;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/**
 * Holder for EncryptionUtil to be used by Hibernate converters.
 * Hibernate converters are not Spring-managed beans, so we need this bridge
 * to provide static access to the encryption utility.
 *
 * Key improvements:
 * - Fails fast if encryption.key is missing (instead of silent fallback)
 * - Proper exception handling with custom EncryptionException/DecryptionException
 * - Thread-safe singleton pattern using volatile
 */
@Component
@Slf4j
public class EncryptionUtilHolder {

    private static volatile EncryptionUtil encryptionUtil;
    private static final Object lock = new Object();

    public EncryptionUtilHolder(@Value("${encryption.key:}") String encryptionKeyString) {
        synchronized (lock) {
            if (encryptionUtil == null) {
                try {
                    encryptionUtil = new EncryptionUtil(encryptionKeyString);
                    log.info("✓ EncryptionUtil initialized successfully for Hibernate converters");
                } catch (Exception e) {
                    log.error("✗ Failed to initialize EncryptionUtil", e);
                    throw new RuntimeException("Encryption initialization failed", e);
                }
            }
        }
    }

    /**
     * Get the shared EncryptionUtil instance.
     *
     * @return initialized EncryptionUtil singleton
     * @throws IllegalStateException if EncryptionUtil was never initialized (Spring startup failed)
     */
    public static EncryptionUtil getEncryptionUtil() {
        if (encryptionUtil == null) {
            // This should never happen if Spring initialized the component successfully
            log.error("⚠️ EncryptionUtil not initialized! Spring may have failed during startup.");
            throw new IllegalStateException(
                    "EncryptionUtil is not initialized. Check that EncryptionUtilHolder bean was created.");
        }
        return encryptionUtil;
    }

    /**
     * Encrypt a plaintext string using the shared EncryptionUtil.
     * Convenience method for Hibernate converters.
     *
     * @param plainText text to encrypt
     * @return encrypted (Base64) string
     * @throws EncryptionUtil.EncryptionException if encryption fails
     * @throws IllegalArgumentException if plainText is null or empty
     */
    public static String encrypt(String plainText) throws EncryptionUtil.EncryptionException {
        return getEncryptionUtil().encrypt(plainText);
    }

    /**
     * Decrypt a ciphertext string using the shared EncryptionUtil.
     * Convenience method for Hibernate converters.
     *
     * @param encryptedValue Base64-encoded ciphertext to decrypt
     * @return decrypted plaintext
     * @throws EncryptionUtil.DecryptionException if decryption fails (bad tag, wrong key, malformed data)
     * @throws IllegalArgumentException if encryptedValue is null or empty
     */
    public static String decrypt(String encryptedValue) throws EncryptionUtil.DecryptionException {
        return getEncryptionUtil().decrypt(encryptedValue);
    }
}