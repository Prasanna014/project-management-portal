package com.company.projectmanagement.security;

import com.company.projectmanagement.entity.Permission;
import com.company.projectmanagement.entity.Role;
import com.company.projectmanagement.entity.RolePermission;
import com.company.projectmanagement.entity.User;
import com.company.projectmanagement.entity.UserRole;
import com.company.projectmanagement.repository.PermissionRepository;
import com.company.projectmanagement.repository.RolePermissionRepository;
import com.company.projectmanagement.repository.RoleRepository;
import com.company.projectmanagement.repository.UserRepository;
import com.company.projectmanagement.repository.UserRoleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class DatabaseUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;
    private final UserRoleRepository userRoleRepository;
    private final RoleRepository roleRepository;
    private final RolePermissionRepository rolePermissionRepository;
    private final PermissionRepository permissionRepository;

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findByEmailAndActiveTrue(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found or inactive"));

        Set<GrantedAuthority> authorities = new HashSet<>();

        List<UserRole> roles = userRoleRepository.findByUserIdAndActive(user.getId(), true);
        for (UserRole userRole : roles) {
            Role role = roleRepository.findById(userRole.getRoleId()).orElse(null);
            if (role == null || !Boolean.TRUE.equals(role.getActive())) {
                continue;
            }

            authorities.add(new SimpleGrantedAuthority("ROLE_" + role.getRoleKey()));

            List<RolePermission> rolePermissions = rolePermissionRepository.findByRoleId(role.getId());
            for (RolePermission rolePermission : rolePermissions) {
                Permission permission = permissionRepository.findById(rolePermission.getPermissionId()).orElse(null);
                if (permission != null && Boolean.TRUE.equals(permission.getActive())) {
                    authorities.add(new SimpleGrantedAuthority(permission.getPermissionKey()));
                }
            }
        }

        if (user.getRole() != null && !user.getRole().isBlank()) {
            authorities.add(new SimpleGrantedAuthority(user.getRole()));
        }

        return new SecurityUserPrincipal(
                user.getId(),
                user.getEmail(),
                user.getPasswordHash() == null ? "" : user.getPasswordHash(),
                authorities,
                Boolean.TRUE.equals(user.getActive())
        );
    }
}
