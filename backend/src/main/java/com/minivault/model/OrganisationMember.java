package com.minivault.model;

import com.minivault.enums.OrgRole;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UuidGenerator;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "organisation_members",
        uniqueConstraints = @UniqueConstraint(columnNames = {"organisation_id", "account_id"}))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrganisationMember {

    @Id
    @UuidGenerator
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organisation_id", nullable = false)
    private Organisation organisation;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "account_id", nullable = false)
    private Account account;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private OrgRole role; // OWNER, ADMIN, MEMBER

    @Column(updatable = false)
    private Instant joinedAt;

    @PrePersist
    public void prePersist() {
        if (joinedAt == null) joinedAt = Instant.now();
    }
}
