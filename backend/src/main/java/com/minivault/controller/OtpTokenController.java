package com.minivault.controller;

import com.minivault.dto.ApiResponse;
import com.minivault.dto.RequestOtpRequest;
import com.minivault.dto.VerifyOtpRequest;
import com.minivault.service.EmailService;
import com.minivault.service.OtpTokenService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class OtpTokenController {

    private final OtpTokenService otpService;
    private final EmailService emailService;

    @PostMapping("/request-otp")
    public ResponseEntity<?> requestOtp(@Valid @RequestBody RequestOtpRequest request) {

        otpService.sendOtp(request.getEmail());

        return ResponseEntity.ok(ApiResponse.success("OTP sent successfully"));
    }

    @PostMapping("/resend-otp")
    public ResponseEntity<?> resendOtp(@Valid @RequestBody RequestOtpRequest request) {

        otpService.resendOtp(request.getEmail());

        return ResponseEntity.ok(ApiResponse.success("OTP sent successfully"));
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(@Valid @RequestBody VerifyOtpRequest request) {

        otpService.verifyOtp(request.getEmail(), request.getOtp());

        return ResponseEntity.ok(ApiResponse.success("OTP verified successfully"));
    }

    @GetMapping("/test-email")
    public String testEmail() {
        emailService.sendOtpEmailHtml("test@email.com", "Inaam", "123456");
        return "Email sent";
    }
}
