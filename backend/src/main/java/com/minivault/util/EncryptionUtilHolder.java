package com.minivault.util;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/**
 * Holder for EncryptionUtil to be used by Hibernate converters.
 * Hibernate converters are not Spring-managed beans, so we need this bridge.
 */
@Component
@Slf4j
public class EncryptionUtilHolder {

    private static EncryptionUtil encryptionUtil;

    public EncryptionUtilHolder(@Value("${encryption.key:}") String encryptionKeyString) {
        try {
            encryptionUtil = new EncryptionUtil(encryptionKeyString);
            log.info("EncryptionUtil initialized for Hibernate converters");
        } catch (Exception e) {
            log.error("Failed to initialize EncryptionUtil for converters", e);
            throw new RuntimeException("Encryption initialization failed", e);
        }
    }

    public static EncryptionUtil getEncryptionUtil() {
        if (encryptionUtil == null) {
            log.warn("EncryptionUtil not initialized, using default key");
            encryptionUtil = new EncryptionUtil("");
        }
        return encryptionUtil;
    }
}
