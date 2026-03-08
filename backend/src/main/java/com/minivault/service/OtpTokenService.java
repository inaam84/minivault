package com.minivault.service;

import com.minivault.model.Account;
import com.minivault.model.OtpToken;
import com.minivault.repository.AccountRepository;
import com.minivault.repository.OtpTokenRepository;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

@Service
@RequiredArgsConstructor
public class OtpTokenService {
    private final OtpTokenRepository otpRepository;
    private final AccountRepository accountRepository;
    private final EmailService emailService;

    public String generateOtp() {
        return String.valueOf((int)((Math.random() * 900000) + 100000));
    }

    public void sendOtp(String email) {
        Account account = accountRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Account not found"));

        long requests = otpRepository.countByAccountAndCreatedAtAfter(
                account,
                Instant.now().minusSeconds(600)
        );

        if (requests >= 3) {
            throw new RuntimeException("Too many OTP requests");
        }

        String otp = generateOtp();

        OtpToken token = OtpToken.builder()
                .account(account)
                .token(otp)
                .createdAt(Instant.now())
                .expiryTime(Instant.now().plusSeconds(300))
                .used(false)
                .attempts(0)
                .build();

        otpRepository.save(token);

        emailService.sendOtpEmail(email, otp);
    }

    public OtpToken createOtp(Account account) {

        String otp = generateOtp();

        OtpToken token = OtpToken.builder()
                .account(account)
                .token(otp)
                .expiryTime(Instant.now().plusSeconds(300)) // 5 minutes
                .used(false)
                .attempts(0)
                .build();

        return otpRepository.save(token);
    }

    @Transactional
    public boolean verifyOtp(@Email @NotBlank String email, String otp) {

        Account account = accountRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Account not found"));

        // Find the latest OTP for the account
        OtpToken token = otpRepository
                .findTopByAccountOrderByCreatedAtDesc(account)
                .orElseThrow(() -> new RuntimeException("OTP not found"));

        if (token.isUsed()) {
            throw new RuntimeException("OTP already used");
        }

        if (token.getExpiryTime().isBefore(Instant.now())) {
            throw new RuntimeException("OTP expired");
        }

        if (token.getAttempts() >= 5) {
            throw new RuntimeException("Too many attempts");
        }

        // Increment attempts
        token.setAttempts(token.getAttempts() + 1);

        if (!token.getToken().equals(otp)) {
            otpRepository.save(token);
            throw new RuntimeException("Invalid OTP");
        }

        // Mark OTP as used
        token.setUsed(true);
        otpRepository.save(token);

        // Mark account as verified
        account.setVerified(true);
        accountRepository.save(account);

        return true;
    }
}
