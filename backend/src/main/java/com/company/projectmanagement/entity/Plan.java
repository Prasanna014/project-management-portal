package com.company.projectmanagement.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Table(name = "plans", schema = "tracker")
@Data
public class Plan {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String planCode;
    private String planName;
    private Integer maxUsers;
    private Integer maxProjects;
    private Long storageLimitMb;
    private Boolean active;
}