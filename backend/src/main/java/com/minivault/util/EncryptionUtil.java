package com.minivault.util;

import java.nio.ByteBuffer;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.util.Base64;
import javax.crypto.Cipher;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import javax.crypto.SecretKey;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
@Slf4j
public class EncryptionUtil {

    private static final String ALGORITHM = "AES/GCM/NoPadding";
    private static final int IV_LENGTH = 12; // 96 bits (recommended)
    private static final int TAG_LENGTH = 128; // bits

    private final SecretKey secretKey;
    private final SecureRandom secureRandom = new SecureRandom();

    public EncryptionUtil(@Value("${encryption.key:}") String encryptionKeyString) {
        if (encryptionKeyString == null || encryptionKeyString.isBlank()) {
            throw new IllegalStateException("CRITICAL: encryption.key is not set!");
        }

        byte[] decodedKey = Base64.getDecoder().decode(encryptionKeyString.trim());

        if (decodedKey.length != 32) {
            throw new IllegalArgumentException("Key must be 32 bytes for AES-256");
        }

        this.secretKey = new SecretKeySpec(decodedKey, "AES");

        log.info("AES-GCM Encryption initialized (key length: {} bytes)", decodedKey.length);
    }

    public String encrypt(String plainText) {
        if (plainText == null || plainText.isEmpty()) return plainText;

        try {
            byte[] iv = new byte[IV_LENGTH];
            secureRandom.nextBytes(iv);

            Cipher cipher = Cipher.getInstance(ALGORITHM);
            GCMParameterSpec spec = new GCMParameterSpec(TAG_LENGTH, iv);

            cipher.init(Cipher.ENCRYPT_MODE, secretKey, spec);

            byte[] encrypted = cipher.doFinal(plainText.getBytes(StandardCharsets.UTF_8));

            // Combine IV + ciphertext
            ByteBuffer buffer = ByteBuffer.allocate(iv.length + encrypted.length);
            buffer.put(iv);
            buffer.put(encrypted);

            return Base64.getEncoder().encodeToString(buffer.array());

        } catch (Exception e) {
            throw new RuntimeException("Encryption failed", e);
        }
    }

    public String decrypt(String encryptedValue) {
        if (encryptedValue == null || encryptedValue.isEmpty()) return encryptedValue;

        try {
            byte[] decoded = Base64.getDecoder().decode(encryptedValue);

            ByteBuffer buffer = ByteBuffer.wrap(decoded);

            byte[] iv = new byte[IV_LENGTH];
            buffer.get(iv);

            byte[] cipherText = new byte[buffer.remaining()];
            buffer.get(cipherText);

            Cipher cipher = Cipher.getInstance(ALGORITHM);
            cipher.init(Cipher.DECRYPT_MODE, secretKey, new GCMParameterSpec(TAG_LENGTH, iv));

            byte[] decrypted = cipher.doFinal(cipherText);

            return new String(decrypted, StandardCharsets.UTF_8);

        } catch (Exception e) {
            log.error("Decryption failed");
            return "[DECRYPTION_FAILED]";
        }
    }
}