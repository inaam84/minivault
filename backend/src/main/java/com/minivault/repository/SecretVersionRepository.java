package com.minivault.repository;

import com.minivault.model.SecretVersion;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SecretVersionRepository extends JpaRepository<SecretVersion, UUID> {
}
