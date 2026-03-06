package com.minivault.model;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UuidGenerator;
import java.util.List;

@Entity
@Table(name = "secrets")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Secret {

    @Id
    @UuidGenerator
    private UUID id;

    @Column(name = "`key`", nullable = false, length = 200)
    private String key;

    @Builder.Default
    @Column(name = "current_version", nullable = false)
    private Integer currentVersion = 1;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private SecretCategory category;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "account_id", nullable = false)
    private Account account;

    @OneToMany(mappedBy = "secret", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("version DESC")
    private List<SecretVersion> versions;

    @CreationTimestamp
    @Column(updatable = false)
    private Instant createdAt;
}
