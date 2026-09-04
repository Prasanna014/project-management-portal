package com.company.projectmanagement.security;

import com.company.projectmanagement.entity.Company;
import com.company.projectmanagement.repository.CompanyRepository;
import com.company.projectmanagement.repository.ProjectRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class TenantUrlValidationFilter extends OncePerRequestFilter {

    public static final String COMPANY_SLUG_HEADER = "X-Company-Slug";
    public static final String PROJECT_SLUG_HEADER = "X-Project-Slug";

    private final CompanyRepository companyRepository;
    private final ProjectRepository projectRepository;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        if (SecurityContextHolder.getContext().getAuthentication() == null
                || !(SecurityContextHolder.getContext().getAuthentication().getPrincipal() instanceof SecurityUserPrincipal principal)) {
            filterChain.doFilter(request, response);
            return;
        }

        String companySlug = request.getHeader(COMPANY_SLUG_HEADER);
        boolean platformAdmin = principal.getAuthorities().stream()
                .anyMatch(authority -> "ROLE_GLOBAL_ADMIN".equalsIgnoreCase(authority.getAuthority()));
        if (!platformAdmin && companySlug != null && !companySlug.isBlank()) {
            Company company = companyRepository.findByCompanySlug(companySlug)
                    .orElse(null);
            if (company == null || !company.getId().equals(principal.companyId())) {
                response.sendError(HttpStatus.FORBIDDEN.value(), "Company URL does not match this account");
                return;
            }
            String projectSlug = request.getHeader(PROJECT_SLUG_HEADER);
            if (projectSlug != null && !projectSlug.isBlank()
                    && projectRepository.findByCompanyIdAndProjectSlug(company.getId(), projectSlug).isEmpty()) {
                response.sendError(HttpStatus.NOT_FOUND.value(), "Project URL was not found for this company");
                return;
            }
        }
        filterChain.doFilter(request, response);
    }
}