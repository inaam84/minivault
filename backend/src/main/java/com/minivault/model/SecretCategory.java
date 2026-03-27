package com.minivault.model;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.Set;
import java.util.UUID;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.annotations.UuidGenerator;

@Entity
@Table(name = "secret_categories")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SecretCategory {

    @Id @UuidGenerator private UUID id;

    @Column(nullable = false, length = 200)
    private String path;

    // Keep account_id for personal secrets
    // null organisation = personal secret
    // non-null organisation = org secret
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "account_id", nullable = false)
    private Account account;

    @OneToMany(mappedBy = "category", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<Secret> secrets;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organisation_id")  // nullable — personal secrets have no org
    private Organisation organisation;

    @CreationTimestamp
    @Column(updatable = false)
    private Instant createdAt;

    @UpdateTimestamp private Instant updatedAt;
}
