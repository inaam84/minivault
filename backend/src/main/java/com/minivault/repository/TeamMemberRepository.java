package com.minivault.repository;

import com.minivault.model.Account;
import com.minivault.model.Team;
import com.minivault.model.TeamMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TeamMemberRepository extends JpaRepository<TeamMember, UUID> {
    List<TeamMember> findByTeam(Team team);
    Optional<TeamMember> findByTeamAndAccount(Team team, Account account);
    boolean existsByTeamAndAccount(Team team, Account account);
    int countByTeam(Team team);
}
