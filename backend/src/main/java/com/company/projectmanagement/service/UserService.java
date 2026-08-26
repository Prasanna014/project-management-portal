// ================= UserService.java =================
package com.company.projectmanagement.service;

import com.company.projectmanagement.dto.UserDto;
import com.company.projectmanagement.entity.User;
import com.company.projectmanagement.exception.BadRequestException;
import com.company.projectmanagement.exception.ResourceNotFoundException;
import com.company.projectmanagement.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserService {

    public static final String STATUS_INVITED = "INVITED";
    public static final String STATUS_ACTIVE = "ACTIVE";
    public static final String STATUS_SUSPENDED = "SUSPENDED";
    public static final String STATUS_DEACTIVATED = "DEACTIVATED";
    public static final String STATUS_PASSWORD_RESET_PENDING = "PASSWORD_RESET_PENDING";
    private static final int INVITATION_EXPIRY_HOURS = 72;
    private static final int RESET_EXPIRY_HOURS = 2;

    private final UserRepository repository;
    private final PasswordEncoder passwordEncoder;
    private final SecureRandom secureRandom = new SecureRandom();

    @Value("${app.frontend-base-url:http://localhost:5173}")
    private String frontendBaseUrl;

    /* ================= GET ALL ================= */
    public List<UserDto> getAllUsers() {
        return repository.findAll()
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    /* ================= GET BY ID ================= */
    public UserDto getUserById(Long id) {
        Long userId = Objects.requireNonNull(id, "User id is required");
        User user = repository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + id));
        return mapToDto(user);
    }

    /* ================= CREATE ================= */
    @Transactional
    public UserDto createUser(UserDto dto) {
        validateCreateRequest(dto);
        validateUniqueIdentifiers(dto.getEmail(), dto.getEmployeeId(), null);

        User entity = mapToEntity(dto);
        entity.setActive(false);
        entity.setPasswordChangeRequired(true);
        entity.setAccountStatus(STATUS_INVITED);
        entity.setPasswordHash(null);
        assignInvitation(entity);
        User saved = repository.save(entity);

        return mapToDto(saved);
    }

    /* ================= UPDATE ================= */
    @Transactional
    public UserDto updateUser(Long id, UserDto dto) {
        Long userId = Objects.requireNonNull(id, "User id is required");
        validateCreateRequest(dto);

        User existing = repository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + id));

        validateUniqueIdentifiers(dto.getEmail(), dto.getEmployeeId(), userId);

        existing.setEmployeeId(dto.getEmployeeId());
        existing.setFullName(dto.getFullName());
        existing.setEmail(dto.getEmail());
        existing.setRole(dto.getRole());
        existing.setActive(dto.getActive());
        if (dto.getPasswordChangeRequired() != null) {
            existing.setPasswordChangeRequired(dto.getPasswordChangeRequired());
        }

        User updated = repository.save(existing);
        return mapToDto(updated);
    }

    /* ================= DELETE ================= */
    @Transactional
    public void deleteUser(Long id) {
        Long userId = Objects.requireNonNull(id, "User id is required");
        repository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + id));
        repository.deleteById(userId);
    }

    /* ================= ACTIVE USERS ================= */
    public List<UserDto> getActiveUsers() {
        return repository.findByActive(true)
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public UserDto resendInvite(Long id) {
        User user = findUser(id);
        user.setActive(false);
        user.setPasswordHash(null);
        user.setPasswordChangeRequired(true);
        user.setAccountStatus(STATUS_INVITED);
        user.setPasswordResetToken(null);
        user.setPasswordResetExpiresAt(null);
        assignInvitation(user);
        return mapToDto(repository.save(user));
    }

    @Transactional
    public UserDto adminResetPassword(Long id) {
        User user = findUser(id);
        user.setPasswordHash(passwordEncoder.encode(generateOpaqueSecret()));
        user.setPasswordChangeRequired(true);
        user.setAccountStatus(STATUS_PASSWORD_RESET_PENDING);
        user.setActive(true);
        user.setInvitationToken(null);
        user.setInvitationExpiresAt(null);
        assignPasswordReset(user);
        return mapToDto(repository.save(user));
    }

    @Transactional
    public UserDto updateAccountStatus(Long id, String nextStatus) {
        User user = findUser(id);
        String normalizedStatus = normalizeStatus(nextStatus);

        switch (normalizedStatus) {
            case STATUS_ACTIVE -> {
                user.setActive(true);
                user.setAccountStatus(user.getPasswordChangeRequired() ? STATUS_PASSWORD_RESET_PENDING : STATUS_ACTIVE);
            }
            case STATUS_SUSPENDED -> {
                user.setActive(false);
                user.setAccountStatus(STATUS_SUSPENDED);
            }
            case STATUS_DEACTIVATED -> {
                user.setActive(false);
                user.setAccountStatus(STATUS_DEACTIVATED);
            }
            case STATUS_INVITED -> {
                user.setActive(false);
                user.setPasswordHash(null);
                user.setPasswordChangeRequired(true);
                user.setAccountStatus(STATUS_INVITED);
                assignInvitation(user);
            }
            default -> throw new BadRequestException("Unsupported account status: " + nextStatus);
        }

        return mapToDto(repository.save(user));
    }

    @Transactional
    public UserDto activateInvitation(String token, String newPassword) {
        if (newPassword == null || newPassword.length() < 8) {
            throw new BadRequestException("New password must be at least 8 characters");
        }

        User user = repository.findByInvitationToken(token)
                .orElseThrow(() -> new ResourceNotFoundException("Invitation is invalid or no longer available"));

        if (user.getInvitationExpiresAt() == null || user.getInvitationExpiresAt().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("Invitation has expired. Please ask an administrator to resend it.");
        }

        user.setPasswordHash(passwordEncoder.encode(newPassword));
        user.setPasswordChangeRequired(false);
        user.setActive(true);
        user.setAccountStatus(STATUS_ACTIVE);
        user.setInvitationToken(null);
        user.setInvitationExpiresAt(null);

        return mapToDto(repository.save(user));
    }

    @Transactional
    public UserDto beginForgotPassword(String email) {
        User user = repository.findByEmail(email).orElse(null);
        if (user == null) {
            return UserDto.builder().email(email).build();
        }

        if (!STATUS_ACTIVE.equals(normalizeStatus(user.getAccountStatus()))
                && !STATUS_PASSWORD_RESET_PENDING.equals(normalizeStatus(user.getAccountStatus()))) {
            throw new BadRequestException("Only active users can request a password reset.");
        }

        user.setPasswordHash(passwordEncoder.encode(generateOpaqueSecret()));
        user.setPasswordChangeRequired(true);
        user.setAccountStatus(STATUS_PASSWORD_RESET_PENDING);
        assignPasswordReset(user);
        return mapToDto(repository.save(user));
    }

    @Transactional
    public UserDto completePasswordReset(String token, String newPassword) {
        if (newPassword == null || newPassword.length() < 8) {
            throw new BadRequestException("New password must be at least 8 characters");
        }

        User user = repository.findByPasswordResetToken(token)
                .orElseThrow(() -> new ResourceNotFoundException("Reset link is invalid or already used"));

        if (user.getPasswordResetExpiresAt() == null || user.getPasswordResetExpiresAt().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("Reset link has expired. Please request a new one.");
        }

        user.setPasswordHash(passwordEncoder.encode(newPassword));
        user.setPasswordChangeRequired(false);
        user.setAccountStatus(STATUS_ACTIVE);
        user.setActive(true);
        user.setPasswordResetToken(null);
        user.setPasswordResetExpiresAt(null);
        return mapToDto(repository.save(user));
    }

    @Transactional
    public void recordSuccessfulLogin(Long userId) {
        User user = findUser(userId);
        user.setLastLoginAt(LocalDateTime.now());
        repository.save(user);
    }

    /* ================= MAPPER ================= */
    private UserDto mapToDto(User u) {
        return UserDto.builder()
                .id(u.getId())
                .employeeId(u.getEmployeeId())
                .fullName(u.getFullName())
                .email(u.getEmail())
                .role(u.getRole())
                .active(u.getActive())
                .passwordChangeRequired(u.getPasswordChangeRequired())
                .accountStatus(u.getAccountStatus())
                .onboardingAccessLink(buildInviteUrl(u.getInvitationToken()))
                .passwordResetLink(buildResetUrl(u.getPasswordResetToken()))
                .invitationExpiresAt(u.getInvitationExpiresAt())
                .passwordResetExpiresAt(u.getPasswordResetExpiresAt())
                .lastLoginAt(u.getLastLoginAt())
                .createdAt(u.getCreatedAt())
                .updatedAt(u.getUpdatedAt())
                .build();
    }

    private User mapToEntity(UserDto dto) {
        return User.builder()
                .id(dto.getId())
                .employeeId(dto.getEmployeeId())
                .fullName(dto.getFullName())
                .email(dto.getEmail())
                .role(dto.getRole())
                .active(dto.getActive())
                .passwordChangeRequired(dto.getPasswordChangeRequired())
                .accountStatus(dto.getAccountStatus())
                .invitationExpiresAt(dto.getInvitationExpiresAt())
                .passwordResetExpiresAt(dto.getPasswordResetExpiresAt())
                .lastLoginAt(dto.getLastLoginAt())
                .createdAt(dto.getCreatedAt())
                .updatedAt(dto.getUpdatedAt())
                .build();
    }

    private User findUser(Long id) {
        Long userId = Objects.requireNonNull(id, "User id is required");
        return repository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + id));
    }

    private void validateCreateRequest(UserDto dto) {
        if (dto.getEmail() == null || dto.getEmail().isBlank()) {
            throw new BadRequestException("Email is required");
        }
        if (dto.getEmployeeId() == null || dto.getEmployeeId().isBlank()) {
            throw new BadRequestException("Employee ID is required");
        }
        if (dto.getFullName() == null || dto.getFullName().isBlank()) {
            throw new BadRequestException("Full name is required");
        }
    }

    private void validateUniqueIdentifiers(String email, String employeeId, Long currentUserId) {
        repository.findByEmail(email)
                .filter(user -> !Objects.equals(user.getId(), currentUserId))
                .ifPresent(user -> {
                    throw new BadRequestException("Email already exists");
                });

        repository.findByEmployeeId(employeeId)
                .filter(user -> !Objects.equals(user.getId(), currentUserId))
                .ifPresent(user -> {
                    throw new BadRequestException("Employee ID already exists");
                });
    }

    private void assignInvitation(User user) {
        user.setInvitationToken(UUID.randomUUID().toString());
        user.setInvitationExpiresAt(LocalDateTime.now().plusHours(INVITATION_EXPIRY_HOURS));
        user.setPasswordResetToken(null);
        user.setPasswordResetExpiresAt(null);
    }

    private void assignPasswordReset(User user) {
        user.setPasswordResetToken(UUID.randomUUID().toString());
        user.setPasswordResetExpiresAt(LocalDateTime.now().plusHours(RESET_EXPIRY_HOURS));
    }

    private String buildInviteUrl(String token) {
        return token == null || token.isBlank()
                ? null
                : frontendBaseUrl + "/activate-account?token=" + token;
    }

    private String buildResetUrl(String token) {
        return token == null || token.isBlank()
                ? null
                : frontendBaseUrl + "/reset-password?token=" + token;
    }

    private String normalizeStatus(String status) {
        return status == null ? "" : status.trim().toUpperCase();
    }

    private String generateOpaqueSecret() {
        return UUID.randomUUID() + "-" + Math.abs(secureRandom.nextLong());
    }
}
