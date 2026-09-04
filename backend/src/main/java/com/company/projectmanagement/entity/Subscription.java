package com.company.projectmanagement.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

import java.time.LocalDate;

@Entity
@Table(name = "subscriptions", schema = "tracker")
@Data
public class Subscription {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private Long companyId;
    private Long planId;
    private LocalDate startDate;
    private LocalDate endDate;
    private String status;
}