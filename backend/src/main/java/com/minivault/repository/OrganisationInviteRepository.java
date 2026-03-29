package com.minivault.repository;

import com.minivault.enums.InviteStatus;
import com.minivault.model.Organisation;
import com.minivault.model.OrganisationInvite;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface OrganisationInviteRepository extends JpaRepository<OrganisationInvite, UUID> {
    Optional<OrganisationInvite> findByToken(String token);
    Optional<OrganisationInvite> findByEmailAndOrganisationAndStatus(
            String email, Organisation org, InviteStatus status);
    List<OrganisationInvite> findByOrganisationAndStatus(Organisation org, InviteStatus status);
}
