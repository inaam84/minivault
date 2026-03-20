package com.minivault.service;

import com.minivault.enums.OtpType;
import com.minivault.exceptions.InvalidOtpException;
import com.minivault.model.Account;
import com.minivault.model.OtpToken;
import com.minivault.repository.AccountRepository;
import com.minivault.repository.OtpTokenRepository;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import java.time.Instant;
import java.util.Optional;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class OtpTokenService {
    private final OtpTokenRepository otpRepository;
    private final AccountRepository accountRepository;
    private final EmailService emailService;

    public String generateOtp() {
        return String.valueOf((int) ((Math.random() * 900000) + 100000));
    }

    public void sendOtp(String email) {
        Account account =
                accountRepository
                        .findByEmail(email)
                        .orElseThrow(() -> new InvalidOtpException("Account not found"));

        long requests =
                otpRepository.countByAccountAndCreatedAtAfter(
                        account, Instant.now().minusSeconds(600));

        if (requests >= 3) {
            throw new InvalidOtpException("Too many OTP requests");
        }

        String otp = generateOtp();

        OtpToken token =
                OtpToken.builder()
                        .account(account)
                        .token(otp)
                        .createdAt(Instant.now())
                        .expiryTime(Instant.now().plusSeconds(300))
                        .used(false)
                        .attempts(0)
                        .build();

        otpRepository.save(token);

        emailService.sendOtpEmailHtml(email, account.getName(), otp);
    }

    public OtpToken createOtp(Account account) {

        String otp = generateOtp();

        OtpToken token =
                OtpToken.builder()
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

        Account account =
                accountRepository
                        .findByEmail(email)
                        .orElseThrow(() -> new InvalidOtpException("Account not found"));

        // Find the latest OTP for the account
        OtpToken token =
                otpRepository
                        .findTopByAccountOrderByCreatedAtDesc(account)
                        .orElseThrow(() -> new InvalidOtpException("OTP not found"));

        if (token.isUsed()) {
            throw new InvalidOtpException("OTP already used");
        }

        if (token.getExpiryTime().isBefore(Instant.now())) {
            throw new InvalidOtpException("OTP expired");
        }

        if (token.getAttempts() >= 5) {
            throw new InvalidOtpException("Too many attempts");
        }

        // If wrong OTP
        if (!token.getToken().equals(otp)) {
            token.setAttempts(token.getAttempts() + 1);
            otpRepository.save(token);
            throw new InvalidOtpException("Invalid OTP");
        }

        // Mark OTP as used
        token.setUsed(true);
        token.setAttempts(0);
        otpRepository.save(token);

        // Mark account as verified
        account.setVerified(true);
        accountRepository.save(account);

        return true;
    }

    @Transactional
    public void resendOtp(String email) {
        // Find account
        Account account =
                accountRepository
                        .findByEmail(email)
                        .orElseThrow(() -> new InvalidOtpException("Account not found"));

        // Check last OTP creation time for throttling (60 seconds)
        otpRepository
                .findTopByAccountOrderByCreatedAtDesc(account)
                .ifPresent(
                        lastOtp -> {
                            if (lastOtp.getCreatedAt().isAfter(Instant.now().minusSeconds(60))) {
                                throw new InvalidOtpException(
                                        "Please wait before requesting a new OTP.");
                            }
                        });

        // Expire previous unused OTPs
        otpRepository
                .findByAccountAndUsedFalse(account)
                .forEach(
                        token -> {
                            token.setUsed(true); // mark old OTP as used
                            otpRepository.save(token);
                        });

        // Generate new OTP
        String newOtp = generateOtp();

        OtpToken otpToken =
                OtpToken.builder()
                        .account(account)
                        .token(newOtp)
                        .used(false)
                        .attempts(0)
                        .expiryTime(Instant.now().plusSeconds(300)) // 5 min expiry
                        .createdAt(Instant.now())
                        .build();
        otpRepository.save(otpToken);

        // Send OTP via email
        emailService.sendOtpEmailHtml(email, account.getName(), newOtp);
    }

    // ─────────────────────────────────────────
    // Send password reset OTP
    // Fails silently if account not found (security best practice)
    // ─────────────────────────────────────────
    public void sendPasswordResetOtp(String email) {
        Optional<Account> accountOpt = accountRepository.findByEmail(email);

        // Silent return if account not found — don't reveal whether email exists
        if (accountOpt.isEmpty()) {
            return;
        }

        Account account = accountOpt.get();

        // Throttle — max 3 reset OTP requests per 10 minutes
        long recentRequests = otpRepository.countByAccountAndTypeAndCreatedAtAfter(
                account,
                OtpType.PASSWORD_RESET,
                Instant.now().minusSeconds(600)
        );

        if (recentRequests >= 3) {
            throw new InvalidOtpException("Too many password reset requests. Please try again later.");
        }

        // Expire all previous unused reset OTPs for this account
        otpRepository.findByAccountAndUsedFalseAndType(account, OtpType.PASSWORD_RESET)
                .forEach(token -> {
                    token.setUsed(true);
                    otpRepository.save(token);
                });

        // Generate and save new OTP
        String otp = generateOtp();

        OtpToken token = OtpToken.builder()
                .account(account)
                .token(otp)
                .type(OtpType.PASSWORD_RESET)
                .expiryTime(Instant.now().plusSeconds(300)) // 5 minutes
                .used(false)
                .attempts(0)
                .build();

        otpRepository.save(token);

        // Send password reset email
        emailService.sendPasswordResetOtpEmail(email, account.getName(), otp);
    }

    // ─────────────────────────────────────────
    // Verify password reset OTP
    // Returns the account if valid — AuthService uses it to update password
    // ─────────────────────────────────────────
    @Transactional
    public Account verifyPasswordResetOtp(String email, String otp) {
        Account account = accountRepository
                .findByEmail(email)
                .orElseThrow(() -> new InvalidOtpException("Invalid request"));

        OtpToken token = otpRepository
                .findTopByAccountAndTypeOrderByCreatedAtDesc(account, OtpType.PASSWORD_RESET)
                .orElseThrow(() -> new InvalidOtpException("OTP not found"));

        if (token.isUsed()) {
            throw new InvalidOtpException("OTP already used");
        }

        if (token.getExpiryTime().isBefore(Instant.now())) {
            throw new InvalidOtpException("OTP expired");
        }

        if (token.getAttempts() >= 5) {
            throw new InvalidOtpException("Too many attempts");
        }

        if (!token.getToken().equals(otp)) {
            token.setAttempts(token.getAttempts() + 1);
            otpRepository.save(token);
            throw new InvalidOtpException("Invalid OTP");
        }

        // Mark as used
        token.setUsed(true);
        otpRepository.save(token);

        return account; // hand back to AuthService
    }
}
