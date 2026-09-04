package com.company.projectmanagement.security;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class TenantAccessService {

    public boolean isPlatformAdmin() {
        SecurityUserPrincipal principal = currentPrincipal();
        return principal != null && principal.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch(authority -> "ROLE_GLOBAL_ADMIN".equalsIgnoreCase(authority)
                    || "GLOBAL_ADMIN".equalsIgnoreCase(authority));
    }

    public boolean hasRole(String roleKey) {
        SecurityUserPrincipal principal = currentPrincipal();
        return principal != null && principal.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch(authority -> ("ROLE_" + roleKey).equalsIgnoreCase(authority)
                        || roleKey.equalsIgnoreCase(authority));
    }

    public Long currentUserIdOrThrow() {
        SecurityUserPrincipal principal = currentPrincipal();
        if (principal == null || principal.userId() == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authenticated user is required");
        }
        return principal.userId();
    }

    public Long currentCompanyIdOrThrow() {
        SecurityUserPrincipal principal = currentPrincipal();
        if (principal == null || principal.companyId() == null) {
            if (isPlatformAdmin()) {
                return null;
            }
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "A company assignment is required for this account");
        }
        return principal.companyId();
    }

    private SecurityUserPrincipal currentPrincipal() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication != null && authentication.getPrincipal() instanceof SecurityUserPrincipal principal
                ? principal
                : null;
    }
}