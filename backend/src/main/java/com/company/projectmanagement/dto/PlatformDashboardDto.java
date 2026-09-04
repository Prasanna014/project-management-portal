package com.company.projectmanagement.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class PlatformDashboardDto {
    private long totalCompanies;
    private long totalProjects;
    private long totalUsers;
    private long totalTickets;
    private long activeCompanies;
    private long suspendedCompanies;
}