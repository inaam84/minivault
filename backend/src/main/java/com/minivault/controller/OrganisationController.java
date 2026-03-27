package com.minivault.controller;

import com.minivault.dto.*;
import com.minivault.model.Account;
import com.minivault.service.AuthService;
import com.minivault.service.OrganisationService;
import com.minivault.service.TeamService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/organisations")
@RequiredArgsConstructor
public class OrganisationController {

    private final OrganisationService organisationService;
    private final TeamService teamService;
    private final AuthService authService;

    @PostMapping
    public ResponseEntity<ApiResponse<OrganisationResponse>> create(
            @RequestBody @Valid CreateOrganisationRequest request) {
        Account account = authService.getAuthenticatedAccount();
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(organisationService.createOrganisation(account, request)));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<OrganisationResponse>> getMyOrg() {
        Account account = authService.getAuthenticatedAccount();
        return ResponseEntity.ok(ApiResponse.success(organisationService.getMyOrganisation(account)));
    }

    @GetMapping("/members")
    public ResponseEntity<ApiResponse<List<MemberResponse>>> getMembers() {
        Account account = authService.getAuthenticatedAccount();
        return ResponseEntity.ok(ApiResponse.success(organisationService.getMembers(account)));
    }

    @PostMapping("/invite")
    public ResponseEntity<ApiResponse<String>> invite(
            @RequestBody @Valid InviteMemberRequest request) {
        Account account = authService.getAuthenticatedAccount();
        organisationService.inviteMember(account, request);
        return ResponseEntity.ok(ApiResponse.success("Invite sent successfully"));
    }

    @PostMapping("/invite/accept")
    public ResponseEntity<ApiResponse<String>> acceptInvite(@RequestParam String token) {
        Account account = authService.getAuthenticatedAccount();
        organisationService.acceptInvite(account, token);
        return ResponseEntity.ok(ApiResponse.success("You have joined the organisation"));
    }

    @DeleteMapping("/members/{accountId}")
    public ResponseEntity<ApiResponse<String>> removeMember(@PathVariable UUID accountId) {
        Account account = authService.getAuthenticatedAccount();
        organisationService.removeMember(account, accountId);
        return ResponseEntity.ok(ApiResponse.success("Member removed"));
    }

    // ── Team endpoints ──

    @PostMapping("/teams")
    public ResponseEntity<ApiResponse<TeamResponse>> createTeam(
            @RequestBody @Valid CreateTeamRequest request) {
        Account account = authService.getAuthenticatedAccount();
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(teamService.createTeam(account, request)));
    }

    @GetMapping("/teams")
    public ResponseEntity<ApiResponse<List<TeamResponse>>> getTeams() {
        Account account = authService.getAuthenticatedAccount();
        return ResponseEntity.ok(ApiResponse.success(teamService.getTeams(account)));
    }

    @PostMapping("/teams/{teamId}/members")
    public ResponseEntity<ApiResponse<String>> addTeamMember(
            @PathVariable UUID teamId,
            @RequestBody @Valid AddTeamMemberRequest request) {
        Account account = authService.getAuthenticatedAccount();
        teamService.addTeamMember(account, teamId, request);
        return ResponseEntity.ok(ApiResponse.success("Member added to team"));
    }

    @DeleteMapping("/teams/{teamId}/members/{accountId}")
    public ResponseEntity<ApiResponse<String>> removeTeamMember(
            @PathVariable UUID teamId,
            @PathVariable UUID accountId) {
        Account account = authService.getAuthenticatedAccount();
        teamService.removeTeamMember(account, teamId, accountId);
        return ResponseEntity.ok(ApiResponse.success("Member removed from team"));
    }
}
