package com.company.projectmanagement.repository;

import com.company.projectmanagement.entity.Company;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CompanyRepository extends JpaRepository<Company, Long> {
    Optional<Company> findByCompanyCode(String companyCode);
    Optional<Company> findByCompanyName(String companyName);
    Optional<Company> findByCompanySlug(String companySlug);
}