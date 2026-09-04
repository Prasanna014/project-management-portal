package com.company.projectmanagement.repository;

import com.company.projectmanagement.entity.BillingRecord;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BillingRecordRepository extends JpaRepository<BillingRecord, Long> {
    List<BillingRecord> findByCompanyId(Long companyId);
}