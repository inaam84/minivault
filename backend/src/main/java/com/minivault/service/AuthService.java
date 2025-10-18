package com.minivault.service;

import com.minivault.dto.SignupRequest;
import com.minivault.dto.SignupResponse;
import com.minivault.exceptions.EmailAlreadyExistsException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.minivault.exceptions.InvalidCredentialsException;
import com.minivault.model.Account;
import com.minivault.repository.AccountRepository;
import com.minivault.security.JwtUtil;

@Service
public class AuthService {

    @Autowired
    AccountRepository accountRepository;

    @Autowired
    PasswordEncoder passwordEncoder;

    @Autowired
    JwtUtil jwtUtil;

    public String login(String email, String password) {
        var userOpt = accountRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            throw new InvalidCredentialsException("Invalid email or password");
        }

        var user = userOpt.get();
        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new InvalidCredentialsException("Invalid email or password");
        }

        return jwtUtil.generateToken(user.getEmail());
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
}
