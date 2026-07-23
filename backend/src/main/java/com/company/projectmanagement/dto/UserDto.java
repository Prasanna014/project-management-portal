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

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}
