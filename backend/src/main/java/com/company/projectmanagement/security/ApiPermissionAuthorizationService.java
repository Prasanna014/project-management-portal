package com.company.projectmanagement.security;

import com.company.projectmanagement.entity.ApiPermissionRule;
import com.company.projectmanagement.repository.ApiPermissionRuleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Service;
import org.springframework.util.AntPathMatcher;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ApiPermissionAuthorizationService {

    private static final AntPathMatcher PATH_MATCHER = new AntPathMatcher();

    private final ApiPermissionRuleRepository apiPermissionRuleRepository;

    public void enforce(String method, String requestPath, Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return;
        }

        List<ApiPermissionRule> activeRules = apiPermissionRuleRepository
                .findActiveRulesByHttpMethodWithPermission(method);

        List<ApiPermissionRule> matchedRules = activeRules.stream()
                .filter(rule -> PATH_MATCHER.match(rule.getPathPattern(), requestPath))
                .toList();

        if (matchedRules.isEmpty()) {
            if (requestPath.startsWith("/api/admin")) {
                throw new AccessDeniedException("No active permission rule configured for this admin endpoint");
            }
            return;
        }

        Set<String> userAuthorities = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toSet());

        boolean allowed = matchedRules.stream()
                .map(rule -> rule.getPermission().getPermissionKey())
                .anyMatch(userAuthorities::contains);

        if (!allowed) {
            throw new AccessDeniedException("Permission denied for this endpoint");
        }
    }
}
