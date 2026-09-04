package com.company.projectmanagement.repository;

import com.company.projectmanagement.entity.Subscription;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SubscriptionRepository extends JpaRepository<Subscription, Long> {
    Optional<Subscription> findTopByCompanyIdOrderByEndDateDesc(Long companyId);
    List<Subscription> findByCompanyId(Long companyId);
}