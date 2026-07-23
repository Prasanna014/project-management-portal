// ================= ActivityService.java =================
package com.company.projectmanagement.service;

import com.company.projectmanagement.dto.ActivityHistoryDto;
import com.company.projectmanagement.entity.ActivityHistory;
import com.company.projectmanagement.repository.ActivityHistoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ActivityService {

    private final ActivityHistoryRepository repository;

    /* ================= GET TASK HISTORY ================= */
    public List<ActivityHistoryDto> getTaskHistory(Long taskId) {
        return repository.findByTaskIdOrderByPerformedAtDesc(taskId)
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    /* ================= CREATE ACTIVITY ================= */
    public ActivityHistoryDto createActivity(ActivityHistoryDto dto) {

        ActivityHistory entity = ActivityHistory.builder()
                .taskId(dto.getTaskId())
                .activityType(dto.getActivityType())
                .oldValue(dto.getOldValue())
                .newValue(dto.getNewValue())
                .performedBy(dto.getPerformedBy())
                .build();

        ActivityHistory saved = repository.save(entity);
        return mapToDto(saved);
    }

    /* ================= MAPPER ================= */
    private ActivityHistoryDto mapToDto(ActivityHistory a) {
        return ActivityHistoryDto.builder()
                .id(a.getId())
                .taskId(a.getTaskId())
                .activityType(a.getActivityType())
                .oldValue(a.getOldValue())
                .newValue(a.getNewValue())
                .performedBy(a.getPerformedBy())
                .performedAt(a.getPerformedAt())
                .build();
    }
}
