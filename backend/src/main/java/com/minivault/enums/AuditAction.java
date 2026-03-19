package com.minivault.enums;

public enum AuditAction {
    // Auth
    LOGIN_SUCCESS,
    LOGIN_FAILED,
    LOGOUT,

    // OTP
    OTP_REQUESTED,
    OTP_VERIFIED,
    OTP_FAILED,
    OTP_EXPIRED,

    // Account
    ACCOUNT_EMAIL_CHANGED,
    ACCOUNT_PASSWORD_CHANGED,
    ACCOUNT_NAME_CHANGED,

    // Secrets
    SECRET_CREATED,
    SECRET_READ,
    SECRET_UPDATED,
    SECRET_DELETED,

    // Categories
    CATEGORY_CREATED,
    CATEGORY_UPDATED,
    CATEGORY_DELETED,
}
