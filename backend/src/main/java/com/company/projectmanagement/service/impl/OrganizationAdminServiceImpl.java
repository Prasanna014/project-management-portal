package com.company.projectmanagement.service.impl;

import com.company.projectmanagement.controller.ApiListQueryHelper;
import com.company.projectmanagement.dto.*;
import com.company.projectmanagement.entity.*;
import com.company.projectmanagement.repository.*;
import com.company.projectmanagement.service.OrganizationAdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Transactional
public class OrganizationAdminServiceImpl implements OrganizationAdminService {

    private final CompanyProfileRepository companyProfileRepository;
    private final BusinessUnitRepository businessUnitRepository;
    private final AppTimeZoneRepository appTimeZoneRepository;
    private final OrgLocationRepository orgLocationRepository;
    private final HolidayRepository holidayRepository;
    private final DepartmentRepository departmentRepository;

    // ─── Company Profile ────────────────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public CompanyProfileDto getProfile() {
        return companyProfileRepository.findTopByOrderByIdAsc()
                .map(this::toProfileDto)
                .orElse(null);
    }

    @Override
    public CompanyProfileDto upsertProfile(CompanyProfileDto dto) {
        CompanyProfile profile = companyProfileRepository.findTopByOrderByIdAsc()
                .orElse(CompanyProfile.builder().build());
        applyProfileDto(profile, dto);
        return toProfileDto(companyProfileRepository.save(profile));
    }

    // ─── Business Units ──────────────────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public Map<String, Object> listBusinessUnits(String keyword, Boolean active, String sortBy, String sortDir, int page, int size) {
        List<BusinessUnitDto> all = businessUnitRepository.findAllByOrderByUnitNameAsc()
                .stream()
                .map(this::toBusinessUnitDto)
                .toList();
        return ApiListQueryHelper.filterSortPaginate(all, keyword, active, sortBy, sortDir, page, size,
                dto -> dto.getUnitCode() + " " + dto.getUnitName(),
                BusinessUnitDto::getActive);
    }

    @Override
    public BusinessUnitDto createBusinessUnit(BusinessUnitDto dto) {
        if (businessUnitRepository.existsByUnitCode(dto.getUnitCode())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Unit code already exists");
        }
        if (businessUnitRepository.existsByUnitName(dto.getUnitName())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Unit name already exists");
        }
        BusinessUnit unit = BusinessUnit.builder()
                .unitCode(dto.getUnitCode())
                .unitName(dto.getUnitName())
                .description(dto.getDescription())
                .departmentId(dto.getDepartmentId())
                .active(dto.getActive() != null ? dto.getActive() : true)
                .build();
        return toBusinessUnitDto(businessUnitRepository.save(unit));
    }

    @Override
    public BusinessUnitDto updateBusinessUnit(Long id, BusinessUnitDto dto) {
        BusinessUnit unit = businessUnitRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Business unit not found"));
        if (businessUnitRepository.existsByUnitCodeAndIdNot(dto.getUnitCode(), id)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Unit code already in use");
        }
        if (businessUnitRepository.existsByUnitNameAndIdNot(dto.getUnitName(), id)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Unit name already in use");
        }
        unit.setUnitCode(dto.getUnitCode());
        unit.setUnitName(dto.getUnitName());
        unit.setDescription(dto.getDescription());
        unit.setDepartmentId(dto.getDepartmentId());
        if (dto.getActive() != null) unit.setActive(dto.getActive());
        return toBusinessUnitDto(businessUnitRepository.save(unit));
    }

    @Override
    public void deleteBusinessUnit(Long id) {
        if (!businessUnitRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Business unit not found");
        }
        businessUnitRepository.deleteById(id);
    }

    // ─── Time Zones ──────────────────────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public Map<String, Object> listTimeZones(String keyword, Boolean active, String sortBy, String sortDir, int page, int size) {
        List<AppTimeZoneDto> all = appTimeZoneRepository.findAllByOrderByTimezoneNameAsc()
                .stream()
                .map(this::toTimeZoneDto)
                .toList();
        return ApiListQueryHelper.filterSortPaginate(all, keyword, active, sortBy, sortDir, page, size,
                dto -> dto.getTimezoneCode() + " " + dto.getTimezoneName() + " " + dto.getUtcOffset(),
                AppTimeZoneDto::getActive);
    }

    @Override
    public AppTimeZoneDto createTimeZone(AppTimeZoneDto dto) {
        if (appTimeZoneRepository.existsByTimezoneCode(dto.getTimezoneCode())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Timezone code already exists");
        }
        if (appTimeZoneRepository.existsByTimezoneName(dto.getTimezoneName())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Timezone name already exists");
        }
        AppTimeZone tz = AppTimeZone.builder()
                .timezoneCode(dto.getTimezoneCode())
                .timezoneName(dto.getTimezoneName())
                .utcOffset(dto.getUtcOffset())
                .active(dto.getActive() != null ? dto.getActive() : true)
                .build();
        return toTimeZoneDto(appTimeZoneRepository.save(tz));
    }

    @Override
    public AppTimeZoneDto updateTimeZone(Long id, AppTimeZoneDto dto) {
        AppTimeZone tz = appTimeZoneRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Time zone not found"));
        if (appTimeZoneRepository.existsByTimezoneCodeAndIdNot(dto.getTimezoneCode(), id)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Timezone code already in use");
        }
        if (appTimeZoneRepository.existsByTimezoneNameAndIdNot(dto.getTimezoneName(), id)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Timezone name already in use");
        }
        tz.setTimezoneCode(dto.getTimezoneCode());
        tz.setTimezoneName(dto.getTimezoneName());
        tz.setUtcOffset(dto.getUtcOffset());
        if (dto.getActive() != null) tz.setActive(dto.getActive());
        return toTimeZoneDto(appTimeZoneRepository.save(tz));
    }

    @Override
    public void deleteTimeZone(Long id) {
        if (!appTimeZoneRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Time zone not found");
        }
        appTimeZoneRepository.deleteById(id);
    }

    // ─── Locations ────────────────────────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public Map<String, Object> listLocations(String keyword, Boolean active, String sortBy, String sortDir, int page, int size) {
        List<OrgLocationDto> all = orgLocationRepository.findAllByOrderByLocationNameAsc()
                .stream()
                .map(this::toLocationDto)
                .toList();
        return ApiListQueryHelper.filterSortPaginate(all, keyword, active, sortBy, sortDir, page, size,
                dto -> dto.getLocationCode() + " " + dto.getLocationName() + " " + nullToEmpty(dto.getCity()),
                OrgLocationDto::getActive);
    }

    @Override
    public OrgLocationDto createLocation(OrgLocationDto dto) {
        if (orgLocationRepository.existsByLocationCode(dto.getLocationCode())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Location code already exists");
        }
        if (orgLocationRepository.existsByLocationName(dto.getLocationName())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Location name already exists");
        }
        OrgLocation loc = OrgLocation.builder()
                .locationCode(dto.getLocationCode())
                .locationName(dto.getLocationName())
                .addressLine1(dto.getAddressLine1())
                .addressLine2(dto.getAddressLine2())
                .city(dto.getCity())
                .state(dto.getState())
                .country(dto.getCountry())
                .timezoneId(dto.getTimezoneId())
                .active(dto.getActive() != null ? dto.getActive() : true)
                .build();
        return toLocationDto(orgLocationRepository.save(loc));
    }

    @Override
    public OrgLocationDto updateLocation(Long id, OrgLocationDto dto) {
        OrgLocation loc = orgLocationRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Location not found"));
        if (orgLocationRepository.existsByLocationCodeAndIdNot(dto.getLocationCode(), id)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Location code already in use");
        }
        if (orgLocationRepository.existsByLocationNameAndIdNot(dto.getLocationName(), id)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Location name already in use");
        }
        loc.setLocationCode(dto.getLocationCode());
        loc.setLocationName(dto.getLocationName());
        loc.setAddressLine1(dto.getAddressLine1());
        loc.setAddressLine2(dto.getAddressLine2());
        loc.setCity(dto.getCity());
        loc.setState(dto.getState());
        loc.setCountry(dto.getCountry());
        loc.setTimezoneId(dto.getTimezoneId());
        if (dto.getActive() != null) loc.setActive(dto.getActive());
        return toLocationDto(orgLocationRepository.save(loc));
    }

    @Override
    public void deleteLocation(Long id) {
        if (!orgLocationRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Location not found");
        }
        orgLocationRepository.deleteById(id);
    }

    // ─── Holidays ────────────────────────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public Map<String, Object> listHolidays(String keyword, Boolean active, String sortBy, String sortDir, int page, int size) {
        List<HolidayDto> all = holidayRepository.findAllByOrderByHolidayDateAsc()
                .stream()
                .map(this::toHolidayDto)
                .toList();
        return ApiListQueryHelper.filterSortPaginate(all, keyword, active, sortBy, sortDir, page, size,
                dto -> dto.getHolidayName() + " " + nullToEmpty(dto.getHolidayType()),
                HolidayDto::getActive);
    }

    @Override
    public HolidayDto createHoliday(HolidayDto dto) {
        Holiday holiday = Holiday.builder()
                .holidayDate(dto.getHolidayDate())
                .holidayName(dto.getHolidayName())
                .holidayType(dto.getHolidayType() != null ? dto.getHolidayType() : "PUBLIC")
                .locationId(dto.getLocationId())
                .recurring(dto.getRecurring() != null ? dto.getRecurring() : false)
                .description(dto.getDescription())
                .active(dto.getActive() != null ? dto.getActive() : true)
                .build();
        return toHolidayDto(holidayRepository.save(holiday));
    }

    @Override
    public HolidayDto updateHoliday(Long id, HolidayDto dto) {
        Holiday holiday = holidayRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Holiday not found"));
        holiday.setHolidayDate(dto.getHolidayDate());
        holiday.setHolidayName(dto.getHolidayName());
        if (dto.getHolidayType() != null) holiday.setHolidayType(dto.getHolidayType());
        holiday.setLocationId(dto.getLocationId());
        if (dto.getRecurring() != null) holiday.setRecurring(dto.getRecurring());
        holiday.setDescription(dto.getDescription());
        if (dto.getActive() != null) holiday.setActive(dto.getActive());
        return toHolidayDto(holidayRepository.save(holiday));
    }

    @Override
    public void deleteHoliday(Long id) {
        if (!holidayRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Holiday not found");
        }
        holidayRepository.deleteById(id);
    }

    // ─── Mappers ─────────────────────────────────────────────────────────────────

    private CompanyProfileDto toProfileDto(CompanyProfile e) {
        CompanyProfileDto dto = new CompanyProfileDto();
        dto.setId(e.getId());
        dto.setCompanyName(e.getCompanyName());
        dto.setTradingName(e.getTradingName());
        dto.setRegistrationNumber(e.getRegistrationNumber());
        dto.setIndustry(e.getIndustry());
        dto.setLogoUrl(e.getLogoUrl());
        dto.setDefaultTimezone(e.getDefaultTimezone());
        dto.setAddressLine1(e.getAddressLine1());
        dto.setAddressLine2(e.getAddressLine2());
        dto.setCity(e.getCity());
        dto.setState(e.getState());
        dto.setCountry(e.getCountry());
        dto.setPhone(e.getPhone());
        dto.setEmail(e.getEmail());
        dto.setWebsite(e.getWebsite());
        dto.setActive(e.getActive());
        return dto;
    }

    private void applyProfileDto(CompanyProfile e, CompanyProfileDto dto) {
        if (dto.getCompanyName() != null) e.setCompanyName(dto.getCompanyName());
        e.setTradingName(dto.getTradingName());
        e.setRegistrationNumber(dto.getRegistrationNumber());
        e.setIndustry(dto.getIndustry());
        e.setLogoUrl(dto.getLogoUrl());
        e.setDefaultTimezone(dto.getDefaultTimezone());
        e.setAddressLine1(dto.getAddressLine1());
        e.setAddressLine2(dto.getAddressLine2());
        e.setCity(dto.getCity());
        e.setState(dto.getState());
        e.setCountry(dto.getCountry());
        e.setPhone(dto.getPhone());
        e.setEmail(dto.getEmail());
        e.setWebsite(dto.getWebsite());
        if (dto.getActive() != null) e.setActive(dto.getActive());
    }

    private BusinessUnitDto toBusinessUnitDto(BusinessUnit e) {
        BusinessUnitDto dto = new BusinessUnitDto();
        dto.setId(e.getId());
        dto.setUnitCode(e.getUnitCode());
        dto.setUnitName(e.getUnitName());
        dto.setDescription(e.getDescription());
        dto.setDepartmentId(e.getDepartmentId());
        if (e.getDepartmentId() != null) {
            departmentRepository.findById(e.getDepartmentId())
                    .ifPresent(d -> dto.setDepartmentName(d.getDepartmentName()));
        }
        dto.setActive(e.getActive());
        return dto;
    }

    private AppTimeZoneDto toTimeZoneDto(AppTimeZone e) {
        AppTimeZoneDto dto = new AppTimeZoneDto();
        dto.setId(e.getId());
        dto.setTimezoneCode(e.getTimezoneCode());
        dto.setTimezoneName(e.getTimezoneName());
        dto.setUtcOffset(e.getUtcOffset());
        dto.setActive(e.getActive());
        return dto;
    }

    private OrgLocationDto toLocationDto(OrgLocation e) {
        OrgLocationDto dto = new OrgLocationDto();
        dto.setId(e.getId());
        dto.setLocationCode(e.getLocationCode());
        dto.setLocationName(e.getLocationName());
        dto.setAddressLine1(e.getAddressLine1());
        dto.setAddressLine2(e.getAddressLine2());
        dto.setCity(e.getCity());
        dto.setState(e.getState());
        dto.setCountry(e.getCountry());
        dto.setTimezoneId(e.getTimezoneId());
        if (e.getTimezoneId() != null) {
            appTimeZoneRepository.findById(e.getTimezoneId())
                    .ifPresent(tz -> dto.setTimezoneName(tz.getTimezoneName()));
        }
        dto.setActive(e.getActive());
        return dto;
    }

    private HolidayDto toHolidayDto(Holiday e) {
        HolidayDto dto = new HolidayDto();
        dto.setId(e.getId());
        dto.setHolidayDate(e.getHolidayDate());
        dto.setHolidayName(e.getHolidayName());
        dto.setHolidayType(e.getHolidayType());
        dto.setLocationId(e.getLocationId());
        if (e.getLocationId() != null) {
            orgLocationRepository.findById(e.getLocationId())
                    .ifPresent(l -> dto.setLocationName(l.getLocationName()));
        }
        dto.setRecurring(e.getRecurring());
        dto.setDescription(e.getDescription());
        dto.setActive(e.getActive());
        return dto;
    }

    private String nullToEmpty(String s) {
        return s != null ? s : "";
    }
}
