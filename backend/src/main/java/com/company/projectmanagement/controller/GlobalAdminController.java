package com.company.projectmanagement.controller;

import com.company.projectmanagement.dto.PlatformDashboardDto;
import com.company.projectmanagement.dto.SubscriptionRequestDto;
import com.company.projectmanagement.dto.TenantStatusRequestDto;
import com.company.projectmanagement.entity.BillingRecord;
import com.company.projectmanagement.entity.Subscription;
import com.company.projectmanagement.entity.TenantStatus;
import com.company.projectmanagement.exception.ResourceNotFoundException;
import com.company.projectmanagement.repository.BillingRecordRepository;
import com.company.projectmanagement.repository.CompanyRepository;
import com.company.projectmanagement.repository.PlanRepository;
import com.company.projectmanagement.repository.ProjectRepository;
import com.company.projectmanagement.repository.SubscriptionRepository;
import com.company.projectmanagement.repository.TaskRepository;
import com.company.projectmanagement.repository.TenantStatusRepository;
import com.company.projectmanagement.repository.UserRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/platform")
@PreAuthorize("hasRole('GLOBAL_ADMIN')")
@RequiredArgsConstructor
public class GlobalAdminController {
    private final CompanyRepository companyRepository;
    private final PlanRepository planRepository;
    private final SubscriptionRepository subscriptionRepository;
    private final TenantStatusRepository tenantStatusRepository;
    private final BillingRecordRepository billingRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final TaskRepository taskRepository;

    @GetMapping("/dashboard")
    public ResponseEntity<PlatformDashboardDto> dashboard() {
        List<TenantStatus> statuses = tenantStatusRepository.findAll();
        return ResponseEntity.ok(PlatformDashboardDto.builder()
                .totalCompanies(companyRepository.count()).totalProjects(projectRepository.count())
                .totalUsers(userRepository.count()).totalTickets(taskRepository.count())
                .activeCompanies(statuses.stream().filter(status -> "ACTIVE".equalsIgnoreCase(status.getStatus())).count())
                .suspendedCompanies(statuses.stream().filter(status -> "SUSPENDED".equalsIgnoreCase(status.getStatus())).count())
                .build());
    }

    @GetMapping("/plans")
    public ResponseEntity<?> listPlans() { return ResponseEntity.ok(planRepository.findAll()); }

    @PostMapping("/subscriptions")
    public ResponseEntity<Subscription> createSubscription(@Valid @RequestBody SubscriptionRequestDto request) {
        companyRepository.findById(request.getCompanyId()).orElseThrow(() -> new ResourceNotFoundException("Company not found"));
        planRepository.findById(request.getPlanId()).orElseThrow(() -> new ResourceNotFoundException("Plan not found"));
        Subscription subscription = new Subscription();
        subscription.setCompanyId(request.getCompanyId()); subscription.setPlanId(request.getPlanId());
        subscription.setStartDate(request.getStartDate()); subscription.setEndDate(request.getEndDate()); subscription.setStatus(request.getStatus());
        return ResponseEntity.ok(subscriptionRepository.save(subscription));
    }

    @PutMapping("/subscriptions/{id}")
    public ResponseEntity<Subscription> updateSubscription(@PathVariable Long id, @Valid @RequestBody SubscriptionRequestDto request) {
        Subscription subscription = subscriptionRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Subscription not found"));
        subscription.setPlanId(request.getPlanId()); subscription.setStartDate(request.getStartDate());
        subscription.setEndDate(request.getEndDate()); subscription.setStatus(request.getStatus());
        return ResponseEntity.ok(subscriptionRepository.save(subscription));
    }

    @PutMapping("/companies/{companyId}/status")
    public ResponseEntity<TenantStatus> updateTenantStatus(@PathVariable Long companyId, @Valid @RequestBody TenantStatusRequestDto request) {
        companyRepository.findById(companyId).orElseThrow(() -> new ResourceNotFoundException("Company not found"));
        TenantStatus status = tenantStatusRepository.findById(companyId).orElseGet(TenantStatus::new);
        status.setCompanyId(companyId); status.setStatus(request.getStatus().trim().toUpperCase());
        return ResponseEntity.ok(tenantStatusRepository.save(status));
    }

    @GetMapping("/companies/{companyId}/billing")
    public ResponseEntity<List<BillingRecord>> billing(@PathVariable Long companyId) {
        return ResponseEntity.ok(billingRepository.findByCompanyId(companyId));
    }

    @PostMapping("/companies/{companyId}/billing/{status}")
    public ResponseEntity<BillingRecord> recordBillingStatus(@PathVariable Long companyId, @PathVariable String status) {
        Subscription subscription = subscriptionRepository.findTopByCompanyIdOrderByEndDateDesc(companyId)
                .orElseThrow(() -> new ResourceNotFoundException("Subscription not found"));
        BillingRecord billing = new BillingRecord();
        billing.setCompanyId(companyId); billing.setSubscriptionId(subscription.getId()); billing.setAmount(java.math.BigDecimal.ZERO);
        billing.setCurrency("USD"); billing.setStatus(status.trim().toUpperCase()); billing.setPaymentDate(LocalDateTime.now());
        return ResponseEntity.ok(billingRepository.save(billing));
    }
}