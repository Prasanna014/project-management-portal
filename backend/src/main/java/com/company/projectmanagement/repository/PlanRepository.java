package com.company.projectmanagement.repository;

import com.company.projectmanagement.entity.Plan;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PlanRepository extends JpaRepository<Plan, Long> {
}