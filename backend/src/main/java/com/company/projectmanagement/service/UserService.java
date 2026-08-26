package com.company.projectmanagement.service;

import com.company.projectmanagement.dto.UserDto;
import com.company.projectmanagement.entity.User;
import com.company.projectmanagement.exception.BadRequestException;
import com.company.projectmanagement.exception.ResourceNotFoundException;
import com.company.projectmanagement.repository.DepartmentRepository;
import com.company.projectmanagement.repository.UserRepository;
import com.company.projectmanagement.security.SecurityUserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
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

    private static final String AUDIT_ENTITY_TYPE = "USER";

    public static final String STATUS_INVITED = "INVITED";
    public static final String STATUS_ACTIVE = "ACTIVE";
    public static final String STATUS_SUSPENDED = "SUSPENDED";
    public static final String STATUS_DEACTIVATED = "DEACTIVATED";
    public static final String STATUS_PASSWORD_RESET_PENDING = "PASSWORD_RESET_PENDING";

    private static final int INVITATION_EXPIRY_HOURS = 72;
    private static final int RESET_EXPIRY_HOURS = 2;

    private final UserRepository repository;
    private final DepartmentRepository departmentRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final AuditLogService auditLogService;
    private final SecureRandom secureRandom = new SecureRandom();

    @Value("${app.frontend-base-url:http://localhost:5173}")
    private String frontendBaseUrl;

    public List<UserDto> getAllUsers() {
        return repository.findAll()
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public UserDto getUserById(Long id) {
        Long userId = Objects.requireNonNull(id, "User id is required");
        User user = repository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + id));
        return mapToDto(user);
    }

    public UserDto getCurrentUserProfile() {
        return mapToDto(findUser(currentActorUserIdOrThrow()));
    }

    @Transactional
    public UserDto createUser(UserDto dto) {
        validateCreateRequest(dto);
        validateUniqueIdentifiers(dto.getEmail(), dto.getEmployeeId(), null);
        validateReferences(dto.getDepartmentId(), dto.getReportingManagerId(), null);

        User entity = mapToEntity(dto);
        entity.setActive(false);
        entity.setPasswordChangeRequired(true);
        entity.setAccountStatus(STATUS_INVITED);
        entity.setPasswordHash(null);
        assignInvitation(entity);

        User saved = repository.save(entity);
        String deliveryStatus = sendInvitation(saved);
        recordAudit("USER_CREATED", null, saved, "User invited to the platform.");
        return mapToDto(saved, deliveryStatus);
    }

    @Transactional
    public UserDto updateUser(Long id, UserDto dto) {
        Long userId = Objects.requireNonNull(id, "User id is required");
        validateCreateRequest(dto);

        User existing = repository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + id));

        validateUniqueIdentifiers(dto.getEmail(), dto.getEmployeeId(), userId);
        validateReferences(dto.getDepartmentId(), dto.getReportingManagerId(), userId);

        String previousState = describeUser(existing);
        existing.setEmployeeId(dto.getEmployeeId());
        existing.setFullName(dto.getFullName());
        existing.setEmail(dto.getEmail());
        existing.setRole(dto.getRole());
        existing.setActive(dto.getActive());
        existing.setDepartmentId(dto.getDepartmentId());
        existing.setDesignation(normalizeNullable(dto.getDesignation()));
        existing.setReportingManagerId(dto.getReportingManagerId());
        if (dto.getPasswordChangeRequired() != null) {
            existing.setPasswordChangeRequired(dto.getPasswordChangeRequired());
        }

        User updated = repository.save(existing);
        recordAudit("USER_UPDATED", previousState, updated, "User profile and access details updated.");
        return mapToDto(updated);
    }

    @Transactional
    public void deleteUser(Long id) {
        Long userId = Objects.requireNonNull(id, "User id is required");
        User user = repository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + id));
        String previousState = describeUser(user);
        repository.deleteById(userId);
        auditLogService.record(AUDIT_ENTITY_TYPE, userId, "USER_DELETED", previousState, null, currentActorUserId(),
                "User account deleted.");
    }

    public List<UserDto> getActiveUsers() {
        return repository.findByActive(true)
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public UserDto resendInvite(Long id) {
        User user = findUser(id);
        String previousState = describeUser(user);

        user.setActive(false);
        user.setPasswordHash(null);
        user.setPasswordChangeRequired(true);
        user.setAccountStatus(STATUS_INVITED);
        user.setPasswordResetToken(null);
        user.setPasswordResetExpiresAt(null);
        assignInvitation(user);

        User saved = repository.save(user);
        String deliveryStatus = sendInvitation(saved);
        recordAudit("USER_INVITE_RESENT", previousState, saved, "Invitation resent by administrator.");
        return mapToDto(saved, deliveryStatus);
    }

    @Transactional
    public UserDto adminResetPassword(Long id) {
        User user = findUser(id);
        String previousState = describeUser(user);

        user.setPasswordHash(passwordEncoder.encode(generateOpaqueSecret()));
        user.setPasswordChangeRequired(true);
        user.setAccountStatus(STATUS_PASSWORD_RESET_PENDING);
        user.setActive(true);
        user.setInvitationToken(null);
        user.setInvitationExpiresAt(null);
        assignPasswordReset(user);

        User saved = repository.save(user);
        String deliveryStatus = sendPasswordReset(saved);
        recordAudit("USER_PASSWORD_RESET_ADMIN", previousState, saved, "Admin generated a password reset link.");
        return mapToDto(saved, deliveryStatus);
    }

    @Transactional
    public UserDto updateAccountStatus(Long id, String nextStatus) {
        User user = findUser(id);
        String normalizedStatus = normalizeStatus(nextStatus);
        String previousState = describeUser(user);

        switch (normalizedStatus) {
            case STATUS_ACTIVE -> {
                user.setActive(true);
                user.setAccountStatus(Boolean.TRUE.equals(user.getPasswordChangeRequired()) ? STATUS_PASSWORD_RESET_PENDING : STATUS_ACTIVE);
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

        User saved = repository.save(user);
        String deliveryStatus = STATUS_INVITED.equals(normalizedStatus) ? sendInvitation(saved) : null;
        recordAudit("USER_STATUS_UPDATED", previousState, saved, "User status changed to " + normalizedStatus + ".");
        return mapToDto(saved, deliveryStatus);
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

        User saved = repository.save(user);
        auditLogService.record(AUDIT_ENTITY_TYPE, saved.getId(), "USER_ACTIVATED", null, describeUser(saved), currentActorUserId(),
                "Invited user activated the account.");
        return mapToDto(saved);
    }

    @Transactional
    public UserDto beginForgotPassword(String email) {
        String normalizedEmail = email == null ? "" : email.trim();
        User user = repository.findByEmail(normalizedEmail).orElse(null);
        if (user == null) {
            return UserDto.builder()
                    .email(normalizedEmail)
                    .emailDeliveryStatus("If an account exists for this email, a reset link will be sent.")
                    .build();
        }

        String currentStatus = normalizeStatus(user.getAccountStatus());
        if (!STATUS_ACTIVE.equals(currentStatus) && !STATUS_PASSWORD_RESET_PENDING.equals(currentStatus)) {
            throw new BadRequestException("Only active users can request a password reset.");
        }

        String previousState = describeUser(user);
        user.setPasswordHash(passwordEncoder.encode(generateOpaqueSecret()));
        user.setPasswordChangeRequired(true);
        user.setAccountStatus(STATUS_PASSWORD_RESET_PENDING);
        assignPasswordReset(user);

        User saved = repository.save(user);
        String deliveryStatus = sendPasswordReset(saved);
        recordAudit("USER_PASSWORD_RESET_REQUESTED", previousState, saved, "Self-service password reset requested.");
        return mapToDto(saved, deliveryStatus);
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

        User saved = repository.save(user);
        auditLogService.record(AUDIT_ENTITY_TYPE, saved.getId(), "USER_PASSWORD_RESET_COMPLETED", null, describeUser(saved),
                currentActorUserId(), "Password reset completed through reset link.");
        return mapToDto(saved);
    }

    @Transactional
    public void recordSuccessfulLogin(Long userId) {
        User user = findUser(userId);
        user.setLastLoginAt(LocalDateTime.now());
        User saved = repository.save(user);
        auditLogService.record(AUDIT_ENTITY_TYPE, saved.getId(), "LOGIN_SUCCESS", null, describeUser(saved),
                saved.getId(), "User signed in successfully.");
    }

    private UserDto mapToDto(User user) {
        return mapToDto(user, null);
    }

    private UserDto mapToDto(User user, String emailDeliveryStatus) {
        return UserDto.builder()
                .id(user.getId())
                .employeeId(user.getEmployeeId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .role(user.getRole())
                .active(user.getActive())
                .passwordChangeRequired(user.getPasswordChangeRequired())
                .departmentId(user.getDepartmentId())
                .departmentName(user.getDepartment() != null ? user.getDepartment().getDepartmentName() : null)
                .designation(user.getDesignation())
                .reportingManagerId(user.getReportingManagerId())
                .reportingManagerName(user.getReportingManager() != null ? user.getReportingManager().getFullName() : null)
                .accountStatus(user.getAccountStatus())
                .onboardingAccessLink(buildInviteUrl(user.getInvitationToken()))
                .passwordResetLink(buildResetUrl(user.getPasswordResetToken()))
                .emailDeliveryStatus(emailDeliveryStatus)
                .invitationExpiresAt(user.getInvitationExpiresAt())
                .passwordResetExpiresAt(user.getPasswordResetExpiresAt())
                .lastLoginAt(user.getLastLoginAt())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
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
                .departmentId(dto.getDepartmentId())
                .designation(normalizeNullable(dto.getDesignation()))
                .reportingManagerId(dto.getReportingManagerId())
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

    private void validateReferences(Long departmentId, Long reportingManagerId, Long currentUserId) {
        if (departmentId != null && !departmentRepository.existsById(departmentId)) {
            throw new BadRequestException("Selected department does not exist");
        }
        if (reportingManagerId != null) {
            if (Objects.equals(reportingManagerId, currentUserId)) {
                throw new BadRequestException("A user cannot report to themselves");
            }
            if (!repository.existsById(reportingManagerId)) {
                throw new BadRequestException("Selected reporting manager does not exist");
            }
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

    private String normalizeNullable(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private String sendInvitation(User user) {
        String inviteUrl = buildInviteUrl(user.getInvitationToken());
        boolean sent = emailService.sendUserInvitationEmail(user.getEmail(), user.getFullName(), inviteUrl, user.getInvitationExpiresAt());
        return sent
                ? "Invitation email sent successfully."
                : "SMTP is not configured. Share the activation link manually.";
    }

    private String sendPasswordReset(User user) {
        String resetUrl = buildResetUrl(user.getPasswordResetToken());
        boolean sent = emailService.sendPasswordResetEmail(user.getEmail(), user.getFullName(), resetUrl, user.getPasswordResetExpiresAt());
        return sent
                ? "Password reset email sent successfully."
                : "SMTP is not configured. Share the password reset link manually.";
    }

    private void recordAudit(String action, String oldValue, User user, String notes) {
        auditLogService.record(AUDIT_ENTITY_TYPE, user.getId(), action, oldValue, describeUser(user), currentActorUserId(), notes);
    }

    private Long currentActorUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof SecurityUserPrincipal principal) {
            return principal.userId();
        }
        return null;
    }

    private Long currentActorUserIdOrThrow() {
        Long actorUserId = currentActorUserId();
        if (actorUserId == null) {
            throw new BadRequestException("Authenticated user is required");
        }
        return actorUserId;
    }

    private String describeUser(User user) {
        return "employeeId=" + user.getEmployeeId()
                + ", fullName=" + user.getFullName()
                + ", email=" + user.getEmail()
                + ", role=" + user.getRole()
                + ", active=" + user.getActive()
                + ", accountStatus=" + user.getAccountStatus()
                + ", departmentId=" + user.getDepartmentId()
                + ", designation=" + user.getDesignation()
                + ", reportingManagerId=" + user.getReportingManagerId()
                + ", passwordChangeRequired=" + user.getPasswordChangeRequired();
    }

    private String generateOpaqueSecret() {
        return UUID.randomUUID() + "-" + Math.abs(secureRandom.nextLong());
    }
}
