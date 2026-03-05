package com.minivault.repository;

import com.minivault.model.SecretCategory;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SecretCategoryRepository extends JpaRepository<SecretCategory, Long> {
    SecretCategory findByPathAndAccountId(String path, Long accountId);
}
