package com.minivault.repository;

import com.minivault.model.SecretCategory;
import java.util.UUID;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SecretCategoryRepository extends JpaRepository<SecretCategory, UUID> {
    SecretCategory findByPathAndAccountId(String path, UUID accountId);
}
