package com.minivault.service;

import com.minivault.dto.CreateOrganisationRequest;
import com.minivault.dto.InviteMemberRequest;
import com.minivault.dto.MemberResponse;
import com.minivault.dto.OrganisationResponse;
import com.minivault.enums.InviteStatus;
import com.minivault.enums.OrgRole;
import com.minivault.model.Account;
import com.minivault.model.Organisation;
import com.minivault.model.OrganisationInvite;
import com.minivault.model.OrganisationMember;
import com.minivault.repository.*;
import com.minivault.util.SlugUtils;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrganisationService {

    private final OrganisationRepository organisationRepository;
    private final OrganisationMemberRepository memberRepository;
    private final TeamRepository teamRepository;
    private final OrganisationInviteRepository inviteRepository;
    private final AccountRepository accountRepository;
    private final EmailService emailService;

    // ─────────────────────────────────────────
    // Create organisation
    // ─────────────────────────────────────────
    @Transactional
    public OrganisationResponse createOrganisation(Account account, CreateOrganisationRequest request) {

        // One org per account
        if (memberRepository.existsByAccount(account)) {
            throw new IllegalArgumentException(
                    "You already belong to an organisation. Leave it before creating a new one.");
        }

        // Generate slug from name
        String baseSlug = SlugUtils.toSlug(request.getName());
        String slug = generateUniqueSlug(baseSlug);

        Organisation org = Organisation.builder()
                .name(request.getName())
                .slug(slug)
                .owner(account)
                .build();

        Organisation savedOrg = organisationRepository.save(org);

        // Add creator as OWNER member automatically
        OrganisationMember ownerMember = OrganisationMember.builder()
                .organisation(savedOrg)
                .account(account)
                .role(OrgRole.OWNER)
                .build();

        memberRepository.save(ownerMember);

        log.info("Organisation '{}' (slug: {}) created by {}",
                savedOrg.getName(), savedOrg.getSlug(), account.getEmail());

        return OrganisationResponse.from(savedOrg, 1, 0);
    }

    // ─────────────────────────────────────────
    // Get an organisation
    // ─────────────────────────────────────────
    public OrganisationResponse getMyOrganisation(Account account) {
        OrganisationMember member = memberRepository.findByAccount(account)
                .orElseThrow(() -> new IllegalArgumentException(
                        "You don't belong to any organisation."));

        Organisation org = member.getOrganisation();
        int memberCount = memberRepository.countByOrganisation(org);
        int teamCount   = teamRepository.countByOrganisation(org);

        return OrganisationResponse.from(org, memberCount, teamCount);
    }

    // ─────────────────────────────────────────
    // List members
    // ─────────────────────────────────────────
    public List<MemberResponse> getMembers(Account account) {
        Organisation org = resolveOrgForAdmin(account);
        return memberRepository.findByOrganisation(org)
                .stream()
                .map(MemberResponse::from)
                .toList();
    }

    // ─────────────────────────────────────────
    // Invite member by email
    // ─────────────────────────────────────────
    @Transactional
    public void inviteMember(Account account, InviteMemberRequest request) {
        // Fetch full account from DB to get name and all fields
        Account fullAccount = accountRepository.findById(account.getId())
                .orElseThrow(() -> new IllegalArgumentException("Account not found"));

        Organisation org = resolveOrgForAdmin(account);

        // Can't invite someone already in an org (one org per account rule)
        accountRepository.findByEmail(request.getEmail()).ifPresent(invitee -> {
            if (memberRepository.existsByAccount(invitee)) {
                throw new IllegalArgumentException(
                        "This user already belongs to an organisation.");
            }
        });

        // Don't send duplicate pending invite
        inviteRepository.findByEmailAndOrganisationAndStatus(
                        request.getEmail(), org, InviteStatus.PENDING)
                .ifPresent(existing -> {
                    throw new IllegalArgumentException(
                            "A pending invite already exists for " + request.getEmail());
                });

        // Generate secure token
        String token = UUID.randomUUID().toString().replace("-", "") +
                UUID.randomUUID().toString().replace("-", "");

        OrganisationInvite invite = OrganisationInvite.builder()
                .organisation(org)
                .email(request.getEmail())
                .token(token)
                .role(request.getRole())
                .status(InviteStatus.PENDING)
                .invitedBy(account)
                .expiresAt(Instant.now().plus(48, ChronoUnit.HOURS))
                .build();

        inviteRepository.save(invite);

        // Send invite email
        String inviteLink = "https://minivault.io/invite/accept?token=" + token;
        emailService.sendInviteEmail(
                request.getEmail(),
                account.getName(),
                org.getName(),
                inviteLink
        );

        log.info("Invite sent to {} for org '{}' by {}",
                request.getEmail(), org.getName(), account.getEmail());
    }

    // ─────────────────────────────────────────
    // Accept invite
    // ─────────────────────────────────────────
    @Transactional
    public void acceptInvite(Account account, String token) {

        OrganisationInvite invite = inviteRepository.findByToken(token)
                .orElseThrow(() -> new IllegalArgumentException("Invite not found or already used."));

        // Check invite is still pending
        if (invite.getStatus() != InviteStatus.PENDING) {
            throw new IllegalArgumentException("This invite has already been " +
                    invite.getStatus().toString().toLowerCase() + ".");
        }

        // Check invite not expired
        if (invite.getExpiresAt().isBefore(Instant.now())) {
            invite.setStatus(InviteStatus.EXPIRED);
            inviteRepository.save(invite);
            throw new IllegalArgumentException("This invite link has expired.");
        }

        // Check invite email matches account email
        if (!invite.getEmail().equalsIgnoreCase(account.getEmail())) {
            throw new AccessDeniedException(
                    "This invite was sent to a different email address.");
        }

        // Check account not already in an org
        if (memberRepository.existsByAccount(account)) {
            throw new IllegalArgumentException(
                    "You already belong to an organisation.");
        }

        // Add as member
        OrganisationMember member = OrganisationMember.builder()
                .organisation(invite.getOrganisation())
                .account(account)
                .role(invite.getRole())
                .build();

        memberRepository.save(member);

        // Mark invite as accepted
        invite.setStatus(InviteStatus.ACCEPTED);
        inviteRepository.save(invite);

        log.info("{} accepted invite to org '{}'",
                account.getEmail(), invite.getOrganisation().getName());
    }

    // ─────────────────────────────────────────
    // Remove member
    // ─────────────────────────────────────────
    @Transactional
    public void removeMember(Account account, UUID targetAccountId) {
        Organisation org = resolveOrgForAdmin(account);

        Account target = accountRepository.findById(targetAccountId)
                .orElseThrow(() -> new IllegalArgumentException("Account not found."));

        OrganisationMember member = memberRepository
                .findByOrganisationAndAccount(org, target)
                .orElseThrow(() -> new IllegalArgumentException(
                        "This account is not a member of your organisation."));

        // Can't remove the owner
        if (member.getRole() == OrgRole.OWNER) {
            throw new AccessDeniedException("The organisation owner cannot be removed.");
        }

        memberRepository.delete(member);
        log.info("{} removed {} from org '{}'",
                account.getEmail(), target.getEmail(), org.getName());
    }

    // ─────────────────────────────────────────
    // Helper — resolve org and check admin/owner
    // ─────────────────────────────────────────
    private Organisation resolveOrgForAdmin(Account account) {
        OrganisationMember member = memberRepository.findByAccount(account)
                .orElseThrow(() -> new IllegalArgumentException(
                        "You don't belong to any organisation."));

        if (member.getRole() == OrgRole.MEMBER) {
            throw new AccessDeniedException(
                    "You need ADMIN or OWNER role to perform this action.");
        }

        return member.getOrganisation();
    }

    private String generateUniqueSlug(String baseSlug) {
        if (!organisationRepository.existsBySlug(baseSlug)) {
            return baseSlug; // slug is free, use as is
        }

        // Append short random suffix until unique
        String candidate;
        do {
            String suffix = UUID.randomUUID().toString().substring(0, 4);
            candidate = baseSlug + "-" + suffix;
        } while (organisationRepository.existsBySlug(candidate));

        return candidate;
    }
}
