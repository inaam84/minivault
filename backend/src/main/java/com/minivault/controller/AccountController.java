package com.minivault.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.minivault.dto.ApiResponse;
import com.minivault.dto.LoginRequest;
import com.minivault.dto.LoginResponse;
import com.minivault.dto.SignupRequest;
import com.minivault.dto.SignupResponse;
import com.minivault.model.Account;
import com.minivault.service.AccountService;
import com.minivault.service.AuthService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.RequestBody;


@RestController
@RequestMapping("/api/auth")
public class AccountController {
    
    private final AccountService accountService;
    private final AuthService authService;

    public AccountController(AccountService accountService, AuthService authService) {
        this.accountService = accountService;
        this.authService = authService;
    }

    @PostMapping("/signup")
    public ResponseEntity<ApiResponse<SignupResponse>> signup(@Valid @RequestBody SignupRequest request) {
        SignupResponse response = accountService.signup(request);

        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(response));
    }
    
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<String>> login(@RequestBody LoginRequest request) {
        String token = authService.login(request.getEmail(), request.getPassword());
        return ResponseEntity.ok(ApiResponse.success(token));
    }    
}
