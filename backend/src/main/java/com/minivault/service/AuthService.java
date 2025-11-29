package com.minivault.service;

import com.minivault.dto.LoginResponse;
import com.minivault.dto.SignupRequest;
import com.minivault.dto.SignupResponse;
import com.minivault.exceptions.EmailAlreadyExistsException;
import com.minivault.exceptions.InvalidCredentialsException;
import com.minivault.model.Account;
import com.minivault.repository.AccountRepository;
import com.minivault.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    @Autowired AccountRepository accountRepository;

    @Autowired PasswordEncoder passwordEncoder;

    @Autowired JwtUtil jwtUtil;

    public LoginResponse login(String email, String password) {
        var accountOpt = accountRepository.findByEmail(email);
        if (accountOpt.isEmpty()) {
            throw new InvalidCredentialsException("Invalid email or password");
        }

        var account = accountOpt.get();
        if (!passwordEncoder.matches(password, account.getPassword())) {
            throw new InvalidCredentialsException("Invalid email or password");
        }

        String token = jwtUtil.generateToken(account.getEmail());

        return new LoginResponse(account.getEmail(), account.getName(), token);
    }

    public SignupResponse signup(SignupRequest request) {
        if (accountRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new EmailAlreadyExistsException(request.getEmail());
        }

        Account account =
                Account.builder()
                        .name(request.getName())
                        .email(request.getEmail())
                        .password(passwordEncoder.encode(request.getPassword()))
                        .build();

        Account savedAccount = accountRepository.save(account);

        String token = jwtUtil.generateToken(account.getEmail());

        return new SignupResponse(savedAccount.getEmail(), savedAccount.getName(), token);
    }
}
