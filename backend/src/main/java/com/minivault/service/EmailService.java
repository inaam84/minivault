package com.minivault.service;

import com.minivault.exceptions.EmailSendingException;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailService {

    @Autowired private JavaMailSender javaMailSender;

    private final JavaMailSender mailSender;

    public String loadTemplate(String templateName) throws IOException {
        Resource resource = new ClassPathResource("templates/" + templateName);

        try (var inputStream = resource.getInputStream()) {
            return new String(inputStream.readAllBytes(), StandardCharsets.UTF_8);
        }
    }

    public void sendOtpEmail(String email, String otp) {

        SimpleMailMessage message = new SimpleMailMessage();

        message.setTo(email);
        message.setSubject("MiniVault OTP Verification");
        message.setText("Your OTP code is: " + otp + "\nIt expires in 5 minutes.");

        mailSender.send(message);
    }

    @Async
    public void sendOtpEmailHtml(String toEmail, String name, String otp) {
        String templateHtml;
        try {
            templateHtml = loadTemplate("otp-email.html");
        } catch (IOException e) {
            throw new EmailSendingException("Failed to load email template", e);
        }
        String subject = "Verify Your Email for MiniVault";
        String htmlContent = templateHtml.replace("{{name}}", name).replace("{{otp}}", otp);

        try {
            MimeMessage message = javaMailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setTo(toEmail);
            helper.setSubject(subject);
            helper.setText(htmlContent, true); // true = HTML

            javaMailSender.send(message);
        } catch (MessagingException e) {
            throw new EmailSendingException("Failed to send email", e);
        }
    }

    @Async
    public void sendPasswordResetOtpEmail(String toEmail, String name, String otp) {
        String templateHtml;
        try {
            templateHtml = loadTemplate("password-reset-email.html");
        } catch (IOException e) {
            throw new EmailSendingException("Failed to load email template", e);
        }
        String subject = "Reset Your MiniVault Password";
        String htmlContent = templateHtml.replace("{{name}}", name).replace("{{otp}}", otp);

        try {
            MimeMessage message = javaMailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setTo(toEmail);
            helper.setSubject(subject);
            helper.setText(htmlContent, true); // true = HTML

            javaMailSender.send(message);
        } catch (MessagingException e) {
            throw new EmailSendingException("Failed to send email", e);
        }
    }
}
