package com.minivault.aspects;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.minivault.annotation.Audited;
import com.minivault.interfaces.AuditableRequest;
import com.minivault.model.Account;
import com.minivault.repository.AccountRepository;
import com.minivault.service.AuditService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;

@Aspect
@Component
@RequiredArgsConstructor
@Slf4j
public class AuditAspect {

    private final AuditService auditService;
    private final AccountRepository accountRepository;
    private final HttpServletRequest request;

    // Intercepts any method annotated with @Audited
    @Around("@annotation(audited)")
    public Object audit(ProceedingJoinPoint joinPoint, Audited audited) throws Throwable {
        String ipAddress = getIpAddress();
        Object result = null;
        boolean success = true;

        try {
            // Run the actual service method
            result = joinPoint.proceed();
            return result;
        } catch (Exception e) {
            success = false;
            throw e; // rethrow so normal error handling still works
        } finally {
            // Always log — whether it succeeded or failed
            try {
                // Resolve account AFTER method runs
                // so login() has had a chance to validate the email
                Account account = resolveAccount(joinPoint, result);

                String resourceId = extractResourceId(joinPoint, result);
                String description = buildDescription(audited.descriptionTemplate(), joinPoint, result);
                String metadata = buildMetadata(joinPoint, result, account);

                auditService.log(
                        account,
                        audited.action(),
                        audited.resource(),
                        resourceId,
                        description,
                        metadata,
                        ipAddress,
                        success
                );
            } catch (Exception e) {
                log.error("AuditAspect failed to log: {}", e.getMessage());
            }
        }
    }

    private Account resolveAccount(ProceedingJoinPoint joinPoint, Object result) {
        // First, get the account from SecurityContext
        try {
            var auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.getPrincipal() instanceof Account account) {
                return account;
            }
        } catch (Exception ignored) {}

        // Fallback for login() — result may carry Account
        if (result != null) {
            // If login response has a hidden Account object
            try {
                var method = result.getClass().getMethod("getAccount");
                Object accountObj = method.invoke(result);
                if (accountObj instanceof Account account) {
                    return account;
                }
            } catch (NoSuchMethodException ignored) {
                // no getAccount() → ignore
            } catch (Exception e) {
                // other reflection errors
            }
        }

        // return null if no account found (AuditService will skip logging)
        return null;
    }

    private Account extractAccount() {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof Account account) {
            return account;
        }
        return null;
    }

    // Gets current logged-in account from Spring Security context
    private Account getCurrentAccount() {
        try {
            // First try security context (works for authenticated requests)
            var auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.getPrincipal() instanceof Account account) {
                return account;
            }
        } catch (Exception ignored) {}
        return null;
    }

    // Handles X-Forwarded-For for proxied requests
    private String getIpAddress() {
        try {
            String forwarded = request.getHeader("X-Forwarded-For");
            if (forwarded != null && !forwarded.isEmpty()) {
                return forwarded.split(",")[0].trim();
            }
            return request.getRemoteAddr();
        } catch (Exception e) {
            return "unknown";
        }
    }

    // If result has an getId() method, extract it as the resourceId
    private String extractResourceId(ProceedingJoinPoint joinPoint, Object result) {
        if (result != null) {
            try {
                var method = result.getClass().getMethod("getId");
                Object id = method.invoke(result);
                if (id != null) return id.toString();
            } catch (Exception ignored) {}
        }

        // Otherwise check AuditableRequest args
        for (Object arg : joinPoint.getArgs()) {
            if (arg instanceof AuditableRequest req) {
                String rid = req.getResourceId();
                if (rid != null) return rid;
            }
        }

        return null;
    }

    private String buildDescription(String template, ProceedingJoinPoint joinPoint, Object result) {
        if (template == null || template.isEmpty()) return null;
        Object[] args = joinPoint.getArgs();
        String desc = template;

        for (int i = 0; i < args.length; i++) {
            Object value = args[i];

            if (value instanceof Account account) {
                value = account.getId();
            } else if (value instanceof AuditableRequest req) {
                value = req.getAuditName();
            }

            if (value != null) {
                desc = desc.replace("{" + i + "}", value.toString());
            }
        }
        return desc;
    }

    private String buildMetadata(ProceedingJoinPoint joinPoint, Object result, Account account) {
        Map<String, Object> meta = new HashMap<>();
        if (account != null) meta.put("accountId", account.getId());

        // Include request arguments implementing AuditableRequest
        for (Object arg : joinPoint.getArgs()) {
            if (arg instanceof AuditableRequest req) {
                String resourceId = req.getResourceId();
                if (resourceId != null) meta.put("resourceId", resourceId);

                String extra = req.getAuditMetadata();
                if (extra != null) meta.put("extra", extra);
            }
        }

        // Include result ID if available
        if (result != null) {
            try {
                var method = result.getClass().getMethod("getId");
                Object id = method.invoke(result);
                if (id != null) meta.put("resultId", id.toString());
            } catch (Exception ignored) {
            }
        }

        // Convert map to JSON
        try {
            return new ObjectMapper().writeValueAsString(meta);
        } catch (Exception e) {
            return null;
        }
    }
}
