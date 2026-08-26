// ================= UserDto.java =================
package com.company.projectmanagement.dto;

import lombok.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserDto {

    private Long id;

    @NotBlank(message = "Employee id is required")
    private String employeeId;

    @NotBlank(message = "Full name is required")
    private String fullName;

    @Email(message = "Email must be valid")
    @NotBlank(message = "Email is required")
    private String email;

    private String role;

    private Boolean active;

    private Boolean passwordChangeRequired;

    private Long departmentId;

    private String departmentName;

    private String designation;

    private Long reportingManagerId;

    private String reportingManagerName;

    private String temporaryPassword;

    private String accountStatus;

    private String onboardingAccessLink;

    private String passwordResetLink;

    private String emailDeliveryStatus;

    private LocalDateTime invitationExpiresAt;

    private LocalDateTime passwordResetExpiresAt;

    private LocalDateTime lastLoginAt;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}
