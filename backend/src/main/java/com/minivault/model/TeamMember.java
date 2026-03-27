package com.minivault.model;

import com.minivault.enums.TeamRole;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UuidGenerator;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "team_members",
        uniqueConstraints = @UniqueConstraint(columnNames = {"team_id", "account_id"}))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TeamMember {

    @Id
    @UuidGenerator
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "team_id", nullable = false)
    private Team team;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "account_id", nullable = false)
    private Account account;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private TeamRole role; // LEAD, MEMBER

    @Column(updatable = false)
    private Instant joinedAt;

    @PrePersist
    public void prePersist() {
        if (joinedAt == null) joinedAt = Instant.now();
    }
}
