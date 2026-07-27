package com.company.projectmanagement.security;

import com.company.projectmanagement.entity.ApiPermissionRule;
import com.company.projectmanagement.entity.Permission;
import com.company.projectmanagement.repository.ApiPermissionRuleRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ApiPermissionAuthorizationServiceTest {

    @Mock
    private ApiPermissionRuleRepository repository;

    private ApiPermissionAuthorizationService service;

    @BeforeEach
    void setUp() {
        service = new ApiPermissionAuthorizationService(repository);
    }

    @Test
    void shouldAllowWhenUserHasRequiredPermission() {
        Permission permission = Permission.builder().permissionKey("tasks.read").active(true).build();
        ApiPermissionRule rule = ApiPermissionRule.builder()
                .httpMethod("GET")
                .pathPattern("/api/tasks/**")
                .permission(permission)
                .active(true)
                .build();

        when(repository.findActiveRulesByHttpMethodWithPermission("GET")).thenReturn(List.of(rule));

        var authentication = new UsernamePasswordAuthenticationToken(
                "user",
                "n/a",
                List.of(new SimpleGrantedAuthority("tasks.read"))
        );

        assertThatCode(() -> service.enforce("GET", "/api/tasks/10", authentication))
                .doesNotThrowAnyException();
    }

    @Test
    void shouldDenyAdminWhenNoRuleConfigured() {
        when(repository.findActiveRulesByHttpMethodWithPermission("POST")).thenReturn(List.of());

        var authentication = new UsernamePasswordAuthenticationToken(
                "user",
                "n/a",
                List.of(new SimpleGrantedAuthority("tasks.read"))
        );

        assertThatThrownBy(() -> service.enforce("POST", "/api/admin/roles", authentication))
                .isInstanceOf(AccessDeniedException.class)
                .hasMessageContaining("No active permission rule configured");
    }
}
