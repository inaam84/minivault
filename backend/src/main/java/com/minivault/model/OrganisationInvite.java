package com.minivault.model;

import com.minivault.enums.InviteStatus;
import com.minivault.enums.OrgRole;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UuidGenerator;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "organisation_invites")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrganisationInvite {

    @Id @UuidGenerator
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organisation_id", nullable = false)
    private Organisation organisation;

    @Column(nullable = false)
    private String email; // who was invited

    @Column(nullable = false, unique = true)
    private String token; // the invite token in the link

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private OrgRole role; // what role they'll get — ADMIN or MEMBER

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private InviteStatus status; // PENDING, ACCEPTED, EXPIRED, REVOKED

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "invited_by", nullable = false)
    private Account invitedBy;

    @Column(nullable = false)
    private Instant expiresAt; // invite link valid for 48 hours

    @CreationTimestamp
    @Column(updatable = false)
    private Instant createdAt;
}
