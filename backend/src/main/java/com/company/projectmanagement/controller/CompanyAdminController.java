package com.company.projectmanagement.controller;

import com.company.projectmanagement.dto.CompanyDto;
import com.company.projectmanagement.entity.Company;
import com.company.projectmanagement.exception.BadRequestException;
import com.company.projectmanagement.exception.ResourceNotFoundException;
import com.company.projectmanagement.repository.CompanyRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin/companies")
@RequiredArgsConstructor
@PreAuthorize("hasRole('GLOBAL_ADMIN')")
public class CompanyAdminController {

    private final CompanyRepository companyRepository;

    @GetMapping
    public ResponseEntity<List<CompanyDto>> list() {
        return ResponseEntity.ok(companyRepository.findAll().stream().map(this::toDto).toList());
    }

    @PostMapping
    public ResponseEntity<CompanyDto> create(@Valid @RequestBody CompanyDto request) {
        companyRepository.findByCompanyCode(request.getCompanyCode())
                .ifPresent(company -> { throw new BadRequestException("Company code already exists"); });
        companyRepository.findByCompanyName(request.getCompanyName())
                .ifPresent(company -> { throw new BadRequestException("Company name already exists"); });
        return ResponseEntity.ok(toDto(companyRepository.save(toEntity(request, new Company()))));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CompanyDto> update(@PathVariable Long id, @Valid @RequestBody CompanyDto request) {
        Company company = companyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Company not found: " + id));
        companyRepository.findByCompanyCode(request.getCompanyCode())
                .filter(existing -> !existing.getId().equals(id))
                .ifPresent(existing -> { throw new BadRequestException("Company code already exists"); });
        companyRepository.findByCompanyName(request.getCompanyName())
                .filter(existing -> !existing.getId().equals(id))
                .ifPresent(existing -> { throw new BadRequestException("Company name already exists"); });
        return ResponseEntity.ok(toDto(companyRepository.save(toEntity(request, company))));
    }

    @PutMapping("/{id}/status/{active}")
    public ResponseEntity<CompanyDto> setActive(@PathVariable Long id, @PathVariable boolean active) {
        Company company = companyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Company not found: " + id));
        company.setActive(active);
        return ResponseEntity.ok(toDto(companyRepository.save(company)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        Company company = companyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Company not found: " + id));
        companyRepository.delete(company);
        return ResponseEntity.noContent().build();
    }

    private Company toEntity(CompanyDto request, Company company) {
        company.setCompanyCode(request.getCompanyCode());
        company.setCompanyName(request.getCompanyName());
        company.setCompanySlug(request.getCompanySlug());
        company.setActive(request.getActive());
        return company;
    }

    private CompanyDto toDto(Company company) {
        CompanyDto dto = new CompanyDto();
        dto.setId(company.getId());
        dto.setCompanyCode(company.getCompanyCode());
        dto.setCompanyName(company.getCompanyName());
        dto.setCompanySlug(company.getCompanySlug());
        dto.setActive(company.getActive());
        return dto;
    }
}