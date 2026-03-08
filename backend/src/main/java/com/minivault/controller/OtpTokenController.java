package com.minivault.controller;

import com.minivault.dto.RequestOtpRequest;
import com.minivault.dto.VerifyOtpRequest;
import com.minivault.service.EmailService;
import com.minivault.service.OtpTokenService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class OtpTokenController {

    private final OtpTokenService otpService;
    private final EmailService emailService;

    @PostMapping("/request-otp")
    public String requestOtp(@Valid @RequestBody RequestOtpRequest request) {

        otpService.sendOtp(request.getEmail());

        return "OTP sent successfully";
    }

    @PostMapping("/verify-otp")
    public String verifyOtp(@Valid @RequestBody VerifyOtpRequest request) {

        otpService.verifyOtp(request.getEmail(), request.getOtp());

        return "OTP verified successfully";
    }

    @GetMapping("/test-email")
    public String testEmail() {
        emailService.sendOtpEmail("test@email.com", "123456");
        return "Email sent";
    }
}
