package com.company.projectmanagement.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "billing", schema = "tracker")
@Data
public class BillingRecord {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private Long companyId;
    private Long subscriptionId;
    private BigDecimal amount;
    private String currency;
    private String status;
    private LocalDateTime paymentDate;
    private LocalDate dueDate;
}