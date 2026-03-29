package com.minivault.service;

import com.minivault.annotation.Audited;
import com.minivault.dto.LoginResponse;
import com.minivault.dto.SignupRequest;
import com.minivault.dto.SignupResponse;
import com.minivault.enums.AuditAction;
import com.minivault.enums.AuditResource;
import com.minivault.exceptions.EmailAlreadyExistsException;
import com.minivault.exceptions.InvalidCredentialsException;
import com.minivault.exceptions.InvalidOtpException;
import com.minivault.model.Account;
import com.minivault.repository.AccountRepository;
import com.minivault.security.JwtUtil;
import jakarta.mail.MessagingException;
import java.io.IOException;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    @Autowired AccountRepository accountRepository;

    @Autowired PasswordEncoder passwordEncoder;

    @Autowired JwtUtil jwtUtil;

    @Autowired OtpTokenService otpService;

    @Audited(
            action = AuditAction.LOGIN_SUCCESS,
            resource = AuditResource.AUTH
    )
    public LoginResponse login(String email, String password) {
        var accountOpt = accountRepository.findByEmail(email);
        if (accountOpt.isEmpty()) {
            throw new InvalidCredentialsException("Invalid email or password");
        }

        var account = accountOpt.get();

        boolean matches = passwordEncoder.matches(password, account.getPassword());
        log.info("Raw password: {}", password);
        log.info("Encoded password from DB: {}", account.getPassword());
        log.info("Password match result: {}", matches);
        log.info(new BCryptPasswordEncoder().encode("Password1!"));

        // Check password
        if (!passwordEncoder.matches(password, account.getPassword())) {
            throw new InvalidCredentialsException("Invalid email or password. Please try again.");
        }

        // Check if account is verified
        if (!account.isVerified()) {
            return LoginResponse.builder()
                    .email(account.getEmail())
                    .name(account.getName())
                    .token(null)
                    .message("Please verify your email via OTP before logging in.")
                    .build();
        }

        String token = jwtUtil.generateToken(account.getEmail(), account.getId());

        return LoginResponse.builder()
                .email(account.getEmail())
                .name(account.getName())
                .token(token)
                .message("Login successful")
                .account(account)
                .build();
    }

    public SignupResponse signup(SignupRequest request) throws IOException, MessagingException {
        if (accountRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new EmailAlreadyExistsException(request.getEmail());
        }

        Account account =
                Account.builder()
                        .name(request.getName())
                        .email(request.getEmail())
                        .password(passwordEncoder.encode(request.getPassword()))
                        .verified(false)
                        .build();

        Account savedAccount = accountRepository.save(account);

        // Send OTP email
        otpService.sendOtp(savedAccount.getEmail());

        return SignupResponse.builder()
                .email(savedAccount.getEmail())
                .name(savedAccount.getName())
                .token(null) // no JWT yet
                .message("OTP sent to email for verification")
                .build();
    }

    public Account getAuthenticatedAccount() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            log.error("No authenticated user found in SecurityContext");
            throw new RuntimeException("Unauthenticated");
        }

        Object principal = authentication.getPrincipal();

        if (principal instanceof Account account) {
            log.info("Using authenticated account from SecurityContext: {}", account);
//            return account;
            return accountRepository.findById(account.getId())
                    .orElseThrow(() -> {
                        log.error("Authenticated account not found in DB: {}", account.getId());
                        return new RuntimeException("Account not found");
                    });
        }

        log.error("Unexpected principal type: {}", principal.getClass().getName());
        throw new RuntimeException("Account not found");
    }

    public void logout() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            throw new RuntimeException("No active session to logout from");
        }

        log.info("User {} logged out successfully", authentication.getName());
        SecurityContextHolder.clearContext();
    }

    // ─────────────────────────────────────────
    // Step 1 — request reset, sends OTP email
    // ─────────────────────────────────────────
    public void requestPasswordReset(String email) {
        // OtpTokenService handles silent fail if email not found
        otpService.sendPasswordResetOtp(email);
    }

    // ─────────────────────────────────────────
    // Step 2 — verify OTP + set new password
    // ─────────────────────────────────────────
    @Transactional
    public void resetPassword(String email, String otp, String newPassword) {
        // Verify OTP — throws if invalid/expired
        Account account = otpService.verifyPasswordResetOtp(email, otp);

        // Prevent reusing the same password
        if (passwordEncoder.matches(newPassword, account.getPassword())) {
            throw new InvalidOtpException("New password must be different from your current password.");
        }

        account.setPassword(passwordEncoder.encode(newPassword));
        accountRepository.save(account);
    }
}
