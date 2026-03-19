package com.minivault.service;

import com.minivault.enums.AuditAction;
import com.minivault.enums.AuditResource;
import com.minivault.model.Account;
import com.minivault.model.AuditLog;
import com.minivault.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuditService {

    private final AuditLogRepository auditLogRepository;

    public void log(Account account,
                    AuditAction action,
                    AuditResource resource,
                    String resourceId,
                    String description,
                    String metadata,
                    String ipAddress,
                    boolean success) {
        try {
            if (account == null) {
                log.warn("Skipping audit log because account is null");
                return;
            }

            AuditLog log = AuditLog.builder()
                    .account(account)
                    .action(action)
                    .resource(resource)
                    .resourceId(resourceId)
                    .description(description)
                    .metadata(metadata)
                    .ipAddress(ipAddress)
                    .success(success)
                    .build();

            auditLogRepository.save(log);
        } catch (Exception e) {
            // Never let audit logging break the main flow
            log.error("Failed to write audit log: {}", e.getMessage());
        }
    }
}
