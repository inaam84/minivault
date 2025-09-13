package com.minivault.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.minivault.dto.LoginRequest;
import com.minivault.dto.LoginResponse;
import com.minivault.dto.SignupRequest;
import com.minivault.dto.SignupResponse;
import com.minivault.service.AccountService;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;


@RestController
@RequestMapping("/api/accounts")
public class AccountController {
    
    private final AccountService accountService;

    public AccountController(AccountService accountService) {
        this.accountService = accountService;
    }

    @PostMapping("/signup")
    public SignupResponse signup(@RequestBody SignupRequest request) {
        return accountService.signup(request);
    }
    
    @PostMapping("/login")
    public LoginResponse login(@RequestBody LoginRequest request) {
        return accountService.login(request);
    }    
}
