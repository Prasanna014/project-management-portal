package com.company.projectmanagement.repository;

import com.company.projectmanagement.entity.OrgLocation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrgLocationRepository extends JpaRepository<OrgLocation, Long> {

    List<OrgLocation> findAllByOrderByLocationNameAsc();

    boolean existsByLocationCode(String locationCode);

    boolean existsByLocationName(String locationName);

    boolean existsByLocationCodeAndIdNot(String locationCode, Long id);

    boolean existsByLocationNameAndIdNot(String locationName, Long id);
}
