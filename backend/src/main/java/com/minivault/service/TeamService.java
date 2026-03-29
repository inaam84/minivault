package com.minivault.service;

import com.minivault.dto.AddTeamMemberRequest;
import com.minivault.dto.CreateTeamRequest;
import com.minivault.dto.TeamResponse;
import com.minivault.enums.OrgRole;
import com.minivault.model.*;
import com.minivault.repository.AccountRepository;
import com.minivault.repository.OrganisationMemberRepository;
import com.minivault.repository.TeamMemberRepository;
import com.minivault.repository.TeamRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class TeamService {

    private final AccountRepository accountRepository;
    private final TeamRepository teamRepository;
    private final TeamMemberRepository teamMemberRepository;
    private final OrganisationMemberRepository orgMemberRepository;

    // ─────────────────────────────────────────
    // Create team
    // ─────────────────────────────────────────
    @Transactional
    public TeamResponse createTeam(Account account, CreateTeamRequest request) {
        Organisation org = resolveOrgForAdmin(account);

        if (teamRepository.existsByOrganisationAndName(org, request.getName())) {
            throw new IllegalArgumentException(
                    "A team named '" + request.getName() + "' already exists.");
        }

        Team team = Team.builder()
                .organisation(org)
                .name(request.getName())
                .description(request.getDescription())
                .build();

        Team saved = teamRepository.save(team);
        log.info("Team '{}' created in org '{}'", saved.getName(), org.getName());

        return TeamResponse.from(saved, 0);
    }

    // ─────────────────────────────────────────
    // List teams in org
    // ─────────────────────────────────────────
    public List<TeamResponse> getTeams(Account account) {
        Organisation org = resolveOrgMember(account);
        return teamRepository.findByOrganisation(org)
                .stream()
                .map(t -> TeamResponse.from(t, teamMemberRepository.countByTeam(t)))
                .toList();
    }

    // ─────────────────────────────────────────
    // Add member to team
    // ─────────────────────────────────────────
    @Transactional
    public void addTeamMember(Account account, UUID teamId, AddTeamMemberRequest request) {
        Organisation org = resolveOrgForAdmin(account);
        Team team = resolveTeamInOrg(teamId, org);

        // Find the target account first
        Account target = accountRepository.findById(request.getAccountId())
                .orElseThrow(() -> new IllegalArgumentException("Account not found."));

        // Then verify they are actually a member of this organisation
        orgMemberRepository.findByOrganisationAndAccount(org, target)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Account is not a member of this organisation."));

        if (teamMemberRepository.existsByTeamAndAccount(team, target)) {
            throw new IllegalArgumentException("This account is already in the team.");
        }

        TeamMember member = TeamMember.builder()
                .team(team)
                .account(target)
                .role(request.getRole())
                .build();

        teamMemberRepository.save(member);
        log.info("{} added to team '{}'", target.getEmail(), team.getName());
    }

    // ─────────────────────────────────────────
    // Remove member from team
    // ─────────────────────────────────────────
    @Transactional
    public void removeTeamMember(Account account, UUID teamId, UUID targetAccountId) {
        Organisation org = resolveOrgForAdmin(account);
        Team team = resolveTeamInOrg(teamId, org);

        Account target = orgMemberRepository.findAll()
                .stream()
                .filter(m -> m.getAccount().getId().equals(targetAccountId))
                .map(OrganisationMember::getAccount)
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Account not found."));

        TeamMember member = teamMemberRepository.findByTeamAndAccount(team, target)
                .orElseThrow(() -> new IllegalArgumentException(
                        "This account is not in the team."));

        teamMemberRepository.delete(member);
        log.info("{} removed from team '{}'", target.getEmail(), team.getName());
    }

    // ─────────────────────────────────────────
    // Helpers
    // ─────────────────────────────────────────
    private Organisation resolveOrgForAdmin(Account account) {
        OrganisationMember member = orgMemberRepository.findByAccount(account)
                .orElseThrow(() -> new IllegalArgumentException(
                        "You don't belong to any organisation."));

        if (member.getRole() == OrgRole.MEMBER) {
            throw new AccessDeniedException(
                    "You need ADMIN or OWNER role to perform this action.");
        }

        return member.getOrganisation();
    }

    private Organisation resolveOrgMember(Account account) {
        return orgMemberRepository.findByAccount(account)
                .map(OrganisationMember::getOrganisation)
                .orElseThrow(() -> new IllegalArgumentException(
                        "You don't belong to any organisation."));
    }

    private Team resolveTeamInOrg(UUID teamId, Organisation org) {
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new IllegalArgumentException("Team not found."));

        if (!team.getOrganisation().getId().equals(org.getId())) {
            throw new AccessDeniedException("This team does not belong to your organisation.");
        }

        return team;
    }
}
