package com.minivault.repository;

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
}
