package com.minivault.model;

import com.minivault.util.SecretValueConverter;
import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UuidGenerator;

@Entity
@Table(name = "secret_versions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SecretVersion {

    @Id @UuidGenerator private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "secret_id", nullable = false)
    private Secret secret;

    @Column(nullable = false, columnDefinition = "TEXT")
    @Convert(converter = SecretValueConverter.class)
    private String value;

    @Column(nullable = false)
    private int version;

    @CreationTimestamp
    @Column(updatable = false)
    private Instant createdAt;
}
