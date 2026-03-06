package com.minivault.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Collections;
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
                    UsernamePasswordAuthenticationToken authentication =
                            new UsernamePasswordAuthenticationToken(
                                    username, null, Collections.emptyList());
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                    logger.debug("JWT authenticated user: {} for path: {}", username, requestPath);
                } else {
                    logger.warn("JWT validation failed for path: {}", requestPath);
                    SecurityContextHolder.clearContext();
                }
            } catch (Exception ex) {
                logger.warn("JWT validation failed for path: {}", requestPath, ex);
                SecurityContextHolder.clearContext();
            }
        } else {
            logger.debug("No JWT token found in request for path: {}", requestPath);
        }

        // Continue filter chain regardless of token status
        chain.doFilter(request, response);
    }
}
