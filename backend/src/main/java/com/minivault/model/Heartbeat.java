package com.minivault.model;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;
import lombok.*;
import org.hibernate.annotations.UuidGenerator;

@Entity
@Table(name = "heartbeat")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Heartbeat {
    @Id @UuidGenerator private UUID id;

    private String note;

    private Instant createdAt;

    @PrePersist
    public void prePersist() {
        if (createdAt == null) createdAt = Instant.now();
    }
}
