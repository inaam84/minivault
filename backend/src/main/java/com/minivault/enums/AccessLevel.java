package com.minivault.enums;

public enum AccessLevel {
    READ,   // can only read secrets
    WRITE,  // can read and write
    ADMIN   // can read, write, delete, manage access
}
