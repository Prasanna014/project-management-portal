package com.company.projectmanagement.repository;

import com.company.projectmanagement.entity.AppTimeZone;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AppTimeZoneRepository extends JpaRepository<AppTimeZone, Long> {

    List<AppTimeZone> findAllByOrderByTimezoneNameAsc();

    boolean existsByTimezoneCode(String timezoneCode);

    boolean existsByTimezoneName(String timezoneName);

    boolean existsByTimezoneCodeAndIdNot(String timezoneCode, Long id);

    boolean existsByTimezoneNameAndIdNot(String timezoneName, Long id);
}
