package com.minivault.repository;

import java.util.UUID;

import com.minivault.enums.AuditAction;
import com.minivault.enums.AuditResource;
import com.minivault.model.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, UUID> {

    // All logs for an account, newest first
    Page<AuditLog> findByAccountIdOrderByCreatedAtDesc(UUID accountId, Pageable pageable);

    // Filter by action type
    Page<AuditLog> findByAccountIdAndActionOrderByCreatedAtDesc(UUID accountId, AuditAction action, Pageable pageable);

    // Filter by resource
    Page<AuditLog> findByAccountIdAndResourceOrderByCreatedAtDesc(UUID accountId, AuditResource resource, Pageable pageable);
}
