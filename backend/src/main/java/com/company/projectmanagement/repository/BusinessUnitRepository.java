package com.company.projectmanagement.repository;

import com.company.projectmanagement.entity.BusinessUnit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BusinessUnitRepository extends JpaRepository<BusinessUnit, Long> {

    List<BusinessUnit> findAllByOrderByUnitNameAsc();

    boolean existsByUnitCode(String unitCode);

    boolean existsByUnitName(String unitName);

    boolean existsByUnitCodeAndIdNot(String unitCode, Long id);

    boolean existsByUnitNameAndIdNot(String unitName, Long id);
}
