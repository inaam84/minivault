package com.minivault.model;

import com.minivault.enums.AccessLevel;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UuidGenerator;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "team_secret_access",
        uniqueConstraints = @UniqueConstraint(columnNames = {"team_id", "category_id"}))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TeamSecretAccess {

    @Id @UuidGenerator
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "team_id", nullable = false)
    private Team team;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private SecretCategory category;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private AccessLevel accessLevel; // READ, WRITE, ADMIN

    @CreationTimestamp
    @Column(updatable = false)
    private Instant grantedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "granted_by")
    private Account grantedBy;
}
