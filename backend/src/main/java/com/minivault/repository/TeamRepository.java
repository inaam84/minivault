package com.minivault.repository;

import com.minivault.model.Organisation;
import com.minivault.model.Team;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface TeamRepository extends JpaRepository<Team, UUID> {
    List<Team> findByOrganisation(Organisation org);
    boolean existsByOrganisationAndName(Organisation org, String name);
    int countByOrganisation(Organisation org);
}
