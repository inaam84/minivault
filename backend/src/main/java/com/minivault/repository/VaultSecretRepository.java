package com.minivault.repository;

import com.minivault.model.VaultSecret;
import org.springframework.data.jpa.repository.JpaRepository;

public interface VaultSecretRepository extends JpaRepository<VaultSecret, Long> {}
