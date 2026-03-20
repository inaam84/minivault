package com.minivault.repository;

import com.minivault.enums.OtpType;
import com.minivault.model.Account;
import com.minivault.model.OtpToken;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OtpTokenRepository extends JpaRepository<OtpToken, UUID> {

    Optional<OtpToken> findTopByAccountOrderByCreatedAtDesc(Account account);

    List<OtpToken> findByAccountAndUsedFalse(Account account);

    long countByAccountAndCreatedAtAfter(Account account, Instant time);

    void deleteByExpiryTimeBefore(Instant time);

    // Find latest OTP for account filtered by type
    Optional<OtpToken> findTopByAccountAndTypeOrderByCreatedAtDesc(Account account, OtpType type);

    // Find unused OTPs by account and type
    List<OtpToken> findByAccountAndUsedFalseAndType(Account account, OtpType type);

    // Count recent OTPs by account and type
    long countByAccountAndTypeAndCreatedAtAfter(Account account, OtpType type, Instant after);
}
