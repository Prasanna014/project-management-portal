package com.company.projectmanagement.controller;

import com.company.projectmanagement.dto.HolidayDto;
import com.company.projectmanagement.entity.Holiday;
import com.company.projectmanagement.repository.HolidayRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/organization")
@RequiredArgsConstructor
public class OrganizationController {

    private final HolidayRepository holidayRepository;

    @GetMapping("/holidays")
    public ResponseEntity<List<HolidayDto>> getActiveHolidays() {
        List<HolidayDto> holidays = holidayRepository.findAllByOrderByHolidayDateAsc()
                .stream()
                .filter(holiday -> Boolean.TRUE.equals(holiday.getActive()))
                .map(this::toDto)
                .toList();
        return ResponseEntity.ok(holidays);
    }

    private HolidayDto toDto(Holiday holiday) {
        HolidayDto dto = new HolidayDto();
        dto.setId(holiday.getId());
        dto.setHolidayDate(holiday.getHolidayDate());
        dto.setHolidayName(holiday.getHolidayName());
        dto.setHolidayType(holiday.getHolidayType());
        dto.setLocationId(holiday.getLocationId());
        dto.setRecurring(holiday.getRecurring());
        dto.setDescription(holiday.getDescription());
        dto.setActive(holiday.getActive());
        return dto;
    }
}
