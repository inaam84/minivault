package com.minivault.exceptions;

import com.fasterxml.jackson.databind.exc.InvalidFormatException;
import com.minivault.dto.ApiResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.validation.ObjectError;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import java.util.Arrays;
import java.util.stream.Collectors;

@ControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger logger = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<?>> handleValidationExceptions(
            MethodArgumentNotValidException ex) {
        String errorMessage =
                ex.getBindingResult().getFieldErrors().stream()
                        .map(err -> err.getField() + ": " + err.getDefaultMessage())
                        .findFirst()
                        .orElseGet(
                                () ->
                                        ex.getBindingResult().getGlobalErrors().stream()
                                                .map(ObjectError::getDefaultMessage)
                                                .filter(msg -> msg != null && !msg.isBlank()) // <--
                                                // filter null/blank
                                                .findFirst()
                                                .orElse("Invalid input"));

        logger.warn("Validation failed: {}", errorMessage);
        return ResponseEntity.badRequest()
                .body(ApiResponse.failure("VALIDATION_FAILED", errorMessage));
    }

    // Custom business exception
    @ExceptionHandler(EmailAlreadyExistsException.class)
    public ResponseEntity<ApiResponse<?>> handleEmailExists(EmailAlreadyExistsException ex) {
        logger.warn("Email already exists: {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(ApiResponse.failure("EMAIL_ALREADY_EXISTS", ex.getMessage()));
    }

    @ExceptionHandler(EmailSendingException.class)
    public ResponseEntity<ApiResponse<?>> handleEmailError(EmailSendingException ex) {
        // return 503 Service Unavailable, or 500, with nice message
        logger.error("Email failure", ex);
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                .body(
                        ApiResponse.failure(
                                "EMAIL_NOT_SENT", "Email service temporarily unavailable"));
    }

    @ExceptionHandler(InvalidCredentialsException.class)
    public ResponseEntity<ApiResponse<?>> handleInvalidCredentials(InvalidCredentialsException ex) {
        logger.warn("Invalid credentials: {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(ApiResponse.failure("INVALID_CREDENTIALS", ex.getMessage()));
    }

    // Authentication exceptions
    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ApiResponse<?>> handleAuthenticationException(
            AuthenticationException ex) {
        logger.warn("Authentication failed: {}", ex.getMessage(), ex);
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(ApiResponse.failure("AUTHENTICATION_FAILED", "Authentication failed"));
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiResponse<?>> handleAccessDeniedException(AccessDeniedException ex) {
        logger.warn("Access denied: {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(ApiResponse.failure("ACCESS_DENIED", "Access denied"));
    }

    // Business logic exceptions
    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<ApiResponse<?>> handleIllegalStateException(IllegalStateException ex) {
        logger.warn("Illegal state: {}", ex.getMessage());
        return ResponseEntity.badRequest()
                .body(ApiResponse.failure("INVALID_STATE", ex.getMessage()));
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiResponse<?>> handleIllegalArgumentException(
            IllegalArgumentException ex) {
        logger.warn("Invalid argument: {}", ex.getMessage());
        return ResponseEntity.badRequest()
                .body(ApiResponse.failure("INVALID_ARGUMENT", ex.getMessage()));
    }

    @ExceptionHandler(InvalidOtpException.class)
    public ResponseEntity<ApiResponse<?>> handleInvalidOtp(InvalidOtpException ex) {
        logger.warn("OTP error: {}", ex.getMessage());
        return ResponseEntity.badRequest()
                .body(ApiResponse.failure("INVALID_OTP", ex.getMessage()));
    }

    @ExceptionHandler(org.springframework.web.servlet.resource.NoResourceFoundException.class)
    public ResponseEntity<ApiResponse<?>> handleNoResourceFound(
            org.springframework.web.servlet.resource.NoResourceFoundException ex) {
        logger.warn("Endpoint not found: {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ApiResponse.failure("NOT_FOUND", "The requested endpoint does not exist"));
    }

    // Wrong HTTP method — e.g. GET on a POST endpoint
    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    public ResponseEntity<ApiResponse<?>> handleMethodNotSupported(
            HttpRequestMethodNotSupportedException ex) {
        logger.warn("Method not allowed: {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.METHOD_NOT_ALLOWED)
                .body(ApiResponse.failure("METHOD_NOT_ALLOWED",
                        "HTTP method '" + ex.getMethod() + "' is not supported for this endpoint"));
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ApiResponse<?>> handleInvalidRequestBody(
            HttpMessageNotReadableException ex) {

        String message = "Request body is missing or malformed";

        Throwable cause = ex.getCause();

        if (cause instanceof InvalidFormatException invalidFormat) {
            // Invalid enum value or wrong type
            if (invalidFormat.getTargetType() != null && invalidFormat.getTargetType().isEnum()) {
                String fieldName = invalidFormat.getPath().isEmpty()
                        ? "field"
                        : invalidFormat.getPath().get(invalidFormat.getPath().size() - 1).getFieldName();

                String invalidValue = String.valueOf(invalidFormat.getValue());

                String allowedValues = Arrays.stream(invalidFormat.getTargetType().getEnumConstants())
                        .map(Object::toString)
                        .collect(Collectors.joining(", "));

                message = "Invalid value '" + invalidValue + "' for field '" + fieldName +
                        "'. Allowed values are: " + allowedValues;
            } else {
                // Wrong type e.g. string where number expected
                String fieldName = invalidFormat.getPath().isEmpty()
                        ? "field"
                        : invalidFormat.getPath().get(invalidFormat.getPath().size() - 1).getFieldName();

                message = "Invalid value for field '" + fieldName + "'";
            }
        }

        logger.warn(message);

        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.failure("INVALID_REQUEST_BODY", message));
    }

    // Fallback for unexpected errors
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<?>> handleGeneral(Exception ex) {
        logger.error("Unexpected error occurred", ex);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.failure("INTERNAL_ERROR", "Something went wrong"));
    }
}
