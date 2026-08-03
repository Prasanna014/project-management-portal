package com.company.projectmanagement.service;

import com.company.projectmanagement.dto.*;

import java.util.Map;

public interface OrganizationAdminService {

    // Company Profile (singleton)
    CompanyProfileDto getProfile();
    CompanyProfileDto upsertProfile(CompanyProfileDto dto);

    // Business Units
    Map<String, Object> listBusinessUnits(String keyword, Boolean active, String sortBy, String sortDir, int page, int size);
    BusinessUnitDto createBusinessUnit(BusinessUnitDto dto);
    BusinessUnitDto updateBusinessUnit(Long id, BusinessUnitDto dto);
    void deleteBusinessUnit(Long id);

    // Time Zones
    Map<String, Object> listTimeZones(String keyword, Boolean active, String sortBy, String sortDir, int page, int size);
    AppTimeZoneDto createTimeZone(AppTimeZoneDto dto);
    AppTimeZoneDto updateTimeZone(Long id, AppTimeZoneDto dto);
    void deleteTimeZone(Long id);

    // Locations
    Map<String, Object> listLocations(String keyword, Boolean active, String sortBy, String sortDir, int page, int size);
    OrgLocationDto createLocation(OrgLocationDto dto);
    OrgLocationDto updateLocation(Long id, OrgLocationDto dto);
    void deleteLocation(Long id);

    // Holidays
    Map<String, Object> listHolidays(String keyword, Boolean active, String sortBy, String sortDir, int page, int size);
    HolidayDto createHoliday(HolidayDto dto);
    HolidayDto updateHoliday(Long id, HolidayDto dto);
    void deleteHoliday(Long id);
}
