package com.minivault.service;

import com.minivault.dto.LoginRequest;
import com.minivault.dto.LoginResponse;
import com.minivault.dto.SignupRequest;
import com.minivault.dto.SignupResponse;
import com.minivault.exceptions.EmailAlreadyExistsException;
import com.minivault.model.Account;
import com.minivault.repository.AccountRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AccountService {
    private final AccountRepository accountRepository;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @Autowired
    public AccountService(AccountRepository accountRepository) {
        this.accountRepository = accountRepository;
    }

    public SignupResponse signup(SignupRequest request) {
        if(accountRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new EmailAlreadyExistsException(request.getEmail());
        }

        Account account = Account.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .build();

        Account savedAccount = accountRepository.save(account);

        return new SignupResponse(
            savedAccount.getId(), 
            savedAccount.getEmail()
        );
    }

    public LoginResponse login(LoginRequest request) {
        Account account = accountRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), account.getPassword())) {
            throw new RuntimeException("Invalid email or password");
        }

        return new LoginResponse(
            account.getId(), 
            account.getEmail(), 
            account.getName(), 
            "Login successful"
        );
    }
}
