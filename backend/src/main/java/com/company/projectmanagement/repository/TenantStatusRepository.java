package com.company.projectmanagement.repository;

import com.company.projectmanagement.entity.TenantStatus;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TenantStatusRepository extends JpaRepository<TenantStatus, Long> {
}