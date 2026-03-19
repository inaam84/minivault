package com.minivault.security;

import com.minivault.model.Account;
import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Collections;
import java.util.UUID;
import java.util.function.Function;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

public class JwtAuthFilter extends OncePerRequestFilter {

    private static final Logger logger = LoggerFactory.getLogger(JwtAuthFilter.class);
    private final JwtUtil jwtUtil;

    public JwtAuthFilter(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");
        String requestPath = request.getRequestURI();

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            logger.debug("Processing JWT token for path: {}", requestPath);

            try {
                String username = jwtUtil.extractUsername(token);

                if (username != null && jwtUtil.isTokenValid(token, username)) {
                    // Extract accountId from claims
                    Claims claims = jwtUtil.extractClaim(token, Function.identity());
                    String accountIdStr = claims.get("accountId", String.class);
                    UUID accountId = accountIdStr != null ? UUID.fromString(accountIdStr) : null;

                    if (accountId != null) {
                        // Build minimal Account object for SecurityContext & audit logging
                        Account account = new Account();
                        account.setId(accountId);
                        account.setEmail(username); // optional, can use in description

                        UsernamePasswordAuthenticationToken authentication =
                                new UsernamePasswordAuthenticationToken(
                                        account, null, Collections.emptyList());
                        SecurityContextHolder.getContext().setAuthentication(authentication);

                        logger.debug("JWT authenticated user: {} (id={}) for path: {}", username, accountId, requestPath);
                    } else {
                        logger.warn("JWT token missing accountId claim for path: {}", requestPath);
                        writeErrorResponse(response, HttpServletResponse.SC_UNAUTHORIZED, "Invalid token: missing account identity");
                        SecurityContextHolder.clearContext();
                        return;
                    }
                } else {
                    logger.warn("JWT validation failed for path: {}", requestPath);
                    writeErrorResponse(response, HttpServletResponse.SC_UNAUTHORIZED, "Invalid or expired token");
                    SecurityContextHolder.clearContext();
                    return;
                }
            } catch (io.jsonwebtoken.ExpiredJwtException ex) {
                logger.warn("JWT token expired for path: {}", requestPath);
                writeErrorResponse(response, HttpServletResponse.SC_UNAUTHORIZED, "Token has expired, please login again");
                SecurityContextHolder.clearContext();
                return;

            } catch (io.jsonwebtoken.MalformedJwtException ex) {
                logger.warn("JWT token malformed for path: {}", requestPath);
                writeErrorResponse(response, HttpServletResponse.SC_UNAUTHORIZED, "Malformed token");
                SecurityContextHolder.clearContext();
                return;

            } catch (io.jsonwebtoken.security.SignatureException ex) {
                logger.warn("JWT signature invalid for path: {}", requestPath);
                writeErrorResponse(response, HttpServletResponse.SC_UNAUTHORIZED, "Invalid token signature");
                SecurityContextHolder.clearContext();
                return;

            } catch (Exception ex) {
                logger.warn("JWT validation failed for path: {}", requestPath, ex);
                writeErrorResponse(response, HttpServletResponse.SC_UNAUTHORIZED, "Authentication failed");
                SecurityContextHolder.clearContext();
                return;
            }
        } else {
            logger.debug("No JWT token found in request for path: {}", requestPath);
        }

        // Only reaches here if:
        // 1. No auth header (public endpoint, let Spring Security decide)
        // 2. Token was valid and context was set
        chain.doFilter(request, response);
    }

    private void writeErrorResponse(HttpServletResponse response, int status, String message) throws IOException {
        response.setStatus(status);
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        response.getWriter().write(
                String.format("{\"status\": %d, \"error\": \"%s\"}", status, message)
        );
    }
}
