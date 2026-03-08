package com.minivault.service;

import com.minivault.dto.LoginResponse;
import com.minivault.dto.SignupRequest;
import com.minivault.dto.SignupResponse;
import com.minivault.exceptions.EmailAlreadyExistsException;
import com.minivault.exceptions.InvalidCredentialsException;
import com.minivault.model.Account;
import com.minivault.repository.AccountRepository;
import com.minivault.security.JwtUtil;
import jakarta.mail.MessagingException;
import java.io.IOException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
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

    public LoginResponse login(String email, String password) {
        var accountOpt = accountRepository.findByEmail(email);
        if (accountOpt.isEmpty()) {
            throw new InvalidCredentialsException("Invalid email or password");
        }

        var account = accountOpt.get();

        // Check password
        if (!passwordEncoder.matches(password, account.getPassword())) {
            throw new InvalidCredentialsException("Invalid email or password");
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

        String token = jwtUtil.generateToken(account.getEmail());

        return LoginResponse.builder()
                .email(account.getEmail())
                .name(account.getName())
                .token(token)
                .message("Login successful")
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

        String email = authentication.getName(); // email stored as principal

        log.info("Fetching authenticated account for {}", email);

        return accountRepository
                .findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Account not found"));
    }

    public void logout() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            throw new RuntimeException("No active session to logout from");
        }

        log.info("User {} logged out successfully", authentication.getName());
        SecurityContextHolder.clearContext();
    }
}
