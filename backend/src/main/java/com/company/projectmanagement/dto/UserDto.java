// ================= UserDto.java =================
package com.company.projectmanagement.dto;

import lombok.*;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserDto {

    private Long id;

    private String employeeId;

    private String fullName;

    private String email;

    private String role;

    private Boolean active;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}
