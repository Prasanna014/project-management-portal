package com.company.projectmanagement.service;

import com.company.projectmanagement.entity.Subscription;
import com.company.projectmanagement.entity.TenantStatus;
import com.company.projectmanagement.exception.BadRequestException;
import com.company.projectmanagement.repository.SubscriptionRepository;
import com.company.projectmanagement.repository.TenantStatusRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class TenantSubscriptionService {
    private static final String EXPIRED_MESSAGE = "Your company subscription has expired. Please contact SupportFlow administration.";
    private final TenantStatusRepository tenantStatusRepository;
    private final SubscriptionRepository subscriptionRepository;

    public void ensureLoginAllowed(Long companyId) {
        if (companyId == null) return;
        TenantStatus tenantStatus = tenantStatusRepository.findById(companyId).orElse(null);
        if (tenantStatus != null && !"ACTIVE".equalsIgnoreCase(tenantStatus.getStatus())) {
            throw new BadRequestException(EXPIRED_MESSAGE);
        }
        Subscription subscription = subscriptionRepository.findTopByCompanyIdOrderByEndDateDesc(companyId).orElse(null);
        if (subscription == null || subscription.getEndDate().isBefore(LocalDate.now())
                || !"ACTIVE".equalsIgnoreCase(subscription.getStatus())) {
            throw new BadRequestException(EXPIRED_MESSAGE);
        }
    }
}