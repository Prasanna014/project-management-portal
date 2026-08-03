package com.company.projectmanagement.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "locations", schema = "tracker",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = "location_code"),
                @UniqueConstraint(columnNames = "location_name")
        })
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrgLocation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(name = "location_code", nullable = false, unique = true)
    private String locationCode;

    @NotBlank
    @Column(name = "location_name", nullable = false, unique = true)
    private String locationName;

    @Column(name = "address_line1")
    private String addressLine1;

    @Column(name = "address_line2")
    private String addressLine2;

    @Column(name = "city")
    private String city;

    @Column(name = "state")
    private String state;

    @Column(name = "country")
    private String country;

    @Column(name = "timezone_id")
    private Long timezoneId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "timezone_id", insertable = false, updatable = false)
    private AppTimeZone timezone;

    @Column(name = "active", nullable = false)
    private Boolean active;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        if (this.active == null) this.active = true;
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
