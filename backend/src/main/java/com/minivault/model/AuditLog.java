package com.minivault.model;

import com.minivault.enums.AuditAction;
import com.minivault.enums.AuditResource;
import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UuidGenerator;

@Entity
@Table(name = "audit_log")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditLog {

    @Id
    @UuidGenerator
    private UUID id;

    // Who did it
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "account_id", nullable = false)
    private Account account;

    // What they did - e.g. SECRET_CREATED, LOGIN_SUCCESS
    @Column(nullable = false, length = 50)
    @Enumerated(EnumType.STRING)
    private AuditAction action;

    // What type of thing was affected - e.g. SECRET, CATEGORY, ACCOUNT
    @Column(nullable = false, length = 50)
    @Enumerated(EnumType.STRING)
    private AuditResource resource;

    // ID of the affected entity (secret id, category id etc.)
    @Column(length = 100)
    private String resourceId;

    // Human-readable description e.g. "Created secret DB_PASSWORD in production/database"
    @Column(columnDefinition = "TEXT")
    private String description;

    // Extra context e.g. old value, new path etc. stored as JSON string
    @Column(columnDefinition = "TEXT")
    private String metadata;

    // IP address of the request
    @Column(length = 45) // 45 supports IPv6
    private String ipAddress;

    // Whether action succeeded or failed
    @Column(nullable = false)
    private boolean success;

    @CreationTimestamp
    @Column(updatable = false)
    private Instant createdAt;
}
