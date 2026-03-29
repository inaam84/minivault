package com.minivault.enums;

public enum OrgRole {
    OWNER,   // full control, can delete org
    ADMIN,   // manage members and secrets
    MEMBER   // read/write secrets based on team permissions
}
