package com.company.projectmanagement.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "time_zones", schema = "tracker",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = "timezone_code"),
                @UniqueConstraint(columnNames = "timezone_name")
        })
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AppTimeZone {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(name = "timezone_code", nullable = false, unique = true)
    private String timezoneCode;

    @NotBlank
    @Column(name = "timezone_name", nullable = false, unique = true)
    private String timezoneName;

    @NotBlank
    @Column(name = "utc_offset", nullable = false)
    private String utcOffset;

    @Column(name = "active", nullable = false)
    private Boolean active;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
        if (this.active == null) this.active = true;
    }
}
