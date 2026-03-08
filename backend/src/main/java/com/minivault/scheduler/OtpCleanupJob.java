package com.minivault.scheduler;

import com.minivault.repository.OtpTokenRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.Instant;

@Component
@RequiredArgsConstructor
public class OtpCleanupJob {

    private final OtpTokenRepository otpRepository;

    @Scheduled(cron = "0 0 * * * *")
    public void cleanupExpiredOtps() {
        otpRepository.deleteByExpiryTimeBefore(Instant.now());
    }
}
