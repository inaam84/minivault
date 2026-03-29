package com.minivault.repository;

import com.minivault.model.Account;
import com.minivault.model.Organisation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface OrganisationRepository extends JpaRepository<Organisation, UUID> {
    Optional<Organisation> findBySlug(String slug);
    Optional<Organisation> findByOwner(Account owner);
    boolean existsBySlug(String slug);
}
