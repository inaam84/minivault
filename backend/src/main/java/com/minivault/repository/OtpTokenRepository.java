package com.minivault.repository;

import com.minivault.model.Account;
import com.minivault.model.OtpToken;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

public interface OtpTokenRepository extends JpaRepository<OtpToken, UUID> {

    Optional<OtpToken> findTopByAccountOrderByCreatedAtDesc(Account account);

    long countByAccountAndCreatedAtAfter(Account account, Instant time);

    void deleteByExpiryTimeBefore(Instant time);
}
