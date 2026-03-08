package com.minivault.scheduler;

import com.minivault.repository.OtpTokenRepository;
import java.time.Instant;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class OtpCleanupJob {

    private final OtpTokenRepository otpRepository;

    @Scheduled(cron = "0 0 * * * *")
    public void cleanupExpiredOtps() {
        otpRepository.deleteByExpiryTimeBefore(Instant.now());
    }
}
