package com.company.projectmanagement.controller;

import com.company.projectmanagement.dto.*;
import com.company.projectmanagement.service.OrganizationAdminService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/organization")
@RequiredArgsConstructor
@Validated
public class OrganizationAdminController {

    private final OrganizationAdminService service;

    // ─── Company Profile (singleton) ─────────────────────────────────────────────

    @GetMapping("/profile")
    public ResponseEntity<CompanyProfileDto> getProfile() {
        return ResponseEntity.ok(service.getProfile());
    }

    @PutMapping("/profile")
    public ResponseEntity<CompanyProfileDto> upsertProfile(@RequestBody CompanyProfileDto dto) {
        return ResponseEntity.ok(service.upsertProfile(dto));
    }

    // ─── Business Units ───────────────────────────────────────────────────────────

    @GetMapping("/business-units")
    public ResponseEntity<Map<String, Object>> listBusinessUnits(
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "20") @Min(1) @Max(200) int size,
            @RequestParam(defaultValue = "unitName") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Boolean active
    ) {
        return ResponseEntity.ok(service.listBusinessUnits(keyword, active, sortBy, sortDir, page, size));
    }

    @PostMapping("/business-units")
    public ResponseEntity<BusinessUnitDto> createBusinessUnit(@Valid @RequestBody BusinessUnitDto dto) {
        return ResponseEntity.ok(service.createBusinessUnit(dto));
    }

    @PutMapping("/business-units/{id}")
    public ResponseEntity<BusinessUnitDto> updateBusinessUnit(@PathVariable Long id, @Valid @RequestBody BusinessUnitDto dto) {
        return ResponseEntity.ok(service.updateBusinessUnit(id, dto));
    }

    @DeleteMapping("/business-units/{id}")
    public ResponseEntity<Void> deleteBusinessUnit(@PathVariable Long id) {
        service.deleteBusinessUnit(id);
        return ResponseEntity.noContent().build();
    }

    // ─── Time Zones ───────────────────────────────────────────────────────────────

    @GetMapping("/time-zones")
    public ResponseEntity<Map<String, Object>> listTimeZones(
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "20") @Min(1) @Max(200) int size,
            @RequestParam(defaultValue = "timezoneName") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Boolean active
    ) {
        return ResponseEntity.ok(service.listTimeZones(keyword, active, sortBy, sortDir, page, size));
    }

    @PostMapping("/time-zones")
    public ResponseEntity<AppTimeZoneDto> createTimeZone(@Valid @RequestBody AppTimeZoneDto dto) {
        return ResponseEntity.ok(service.createTimeZone(dto));
    }

    @PutMapping("/time-zones/{id}")
    public ResponseEntity<AppTimeZoneDto> updateTimeZone(@PathVariable Long id, @Valid @RequestBody AppTimeZoneDto dto) {
        return ResponseEntity.ok(service.updateTimeZone(id, dto));
    }

    @DeleteMapping("/time-zones/{id}")
    public ResponseEntity<Void> deleteTimeZone(@PathVariable Long id) {
        service.deleteTimeZone(id);
        return ResponseEntity.noContent().build();
    }

    // ─── Locations ────────────────────────────────────────────────────────────────

    @GetMapping("/locations")
    public ResponseEntity<Map<String, Object>> listLocations(
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "20") @Min(1) @Max(200) int size,
            @RequestParam(defaultValue = "locationName") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Boolean active
    ) {
        return ResponseEntity.ok(service.listLocations(keyword, active, sortBy, sortDir, page, size));
    }

    @PostMapping("/locations")
    public ResponseEntity<OrgLocationDto> createLocation(@Valid @RequestBody OrgLocationDto dto) {
        return ResponseEntity.ok(service.createLocation(dto));
    }

    @PutMapping("/locations/{id}")
    public ResponseEntity<OrgLocationDto> updateLocation(@PathVariable Long id, @Valid @RequestBody OrgLocationDto dto) {
        return ResponseEntity.ok(service.updateLocation(id, dto));
    }

    @DeleteMapping("/locations/{id}")
    public ResponseEntity<Void> deleteLocation(@PathVariable Long id) {
        service.deleteLocation(id);
        return ResponseEntity.noContent().build();
    }

    // ─── Holidays ─────────────────────────────────────────────────────────────────

    @GetMapping("/holidays")
    public ResponseEntity<Map<String, Object>> listHolidays(
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "20") @Min(1) @Max(200) int size,
            @RequestParam(defaultValue = "holidayDate") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Boolean active
    ) {
        return ResponseEntity.ok(service.listHolidays(keyword, active, sortBy, sortDir, page, size));
    }

    @PostMapping("/holidays")
    public ResponseEntity<HolidayDto> createHoliday(@Valid @RequestBody HolidayDto dto) {
        return ResponseEntity.ok(service.createHoliday(dto));
    }

    @PutMapping("/holidays/{id}")
    public ResponseEntity<HolidayDto> updateHoliday(@PathVariable Long id, @Valid @RequestBody HolidayDto dto) {
        return ResponseEntity.ok(service.updateHoliday(id, dto));
    }

    @DeleteMapping("/holidays/{id}")
    public ResponseEntity<Void> deleteHoliday(@PathVariable Long id) {
        service.deleteHoliday(id);
        return ResponseEntity.noContent().build();
    }
}
