package com.minivault.repository;

import com.minivault.model.Account;
import com.minivault.model.Organisation;
import com.minivault.model.OrganisationMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface OrganisationMemberRepository extends JpaRepository<OrganisationMember, UUID> {
    Optional<OrganisationMember> findByAccount(Account account);
    Optional<OrganisationMember> findByOrganisationAndAccount(Organisation org, Account account);
    List<OrganisationMember> findByOrganisation(Organisation org);
    boolean existsByAccount(Account account);
    int countByOrganisation(Organisation org);
}
