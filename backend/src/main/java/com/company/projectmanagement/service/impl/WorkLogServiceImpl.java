package com.company.projectmanagement.service.impl;

import com.company.projectmanagement.controller.ApiListQueryHelper;
import com.company.projectmanagement.dto.WorkLogRequestDto;
import com.company.projectmanagement.dto.WorkLogResponseDto;
import com.company.projectmanagement.entity.WorkLog;
import com.company.projectmanagement.exception.ResourceNotFoundException;
import com.company.projectmanagement.repository.TaskRepository;
import com.company.projectmanagement.repository.UserRepository;
import com.company.projectmanagement.repository.WorkLogRepository;
import com.company.projectmanagement.service.WorkLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class WorkLogServiceImpl implements WorkLogService {

    private final WorkLogRepository workLogRepository;
    private final TaskRepository taskRepository;
    private final UserRepository userRepository;

    @Override
    public Map<String, Object> getWorkLogs(Long taskId, Long userId, String keyword,
                                            String sortBy, String sortDir, int page, int size) {
        List<WorkLog> source;
        if (taskId != null) {
            source = workLogRepository.findByTaskId(taskId, PageRequest.of(0, Integer.MAX_VALUE)).getContent();
        } else if (userId != null) {
            source = workLogRepository.findByUserId(userId, PageRequest.of(0, Integer.MAX_VALUE)).getContent();
        } else {
            source = workLogRepository.findAll();
        }
        List<WorkLogResponseDto> dtos = source.stream().map(this::toDto).collect(Collectors.toList());
        return ApiListQueryHelper.filterSortPaginate(dtos, keyword, null, sortBy, sortDir, page, size,
                d -> (d.getTaskNo() != null ? d.getTaskNo() : "") + " " + (d.getUserName() != null ? d.getUserName() : ""),
                dto -> true);
    }

    @Override
    public WorkLogResponseDto getById(Long id) {
        return toDto(workLogRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Work log not found: " + id)));
    }

    @Override
    @Transactional
    public WorkLogResponseDto createWorkLog(WorkLogRequestDto request) {
        taskRepository.findById(request.getTaskId())
                .orElseThrow(() -> new ResourceNotFoundException("Task not found: " + request.getTaskId()));
        userRepository.findById(request.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + request.getUserId()));

        WorkLog saved = workLogRepository.save(WorkLog.builder()
                .taskId(request.getTaskId())
                .userId(request.getUserId())
                .hoursLogged(request.getHoursLogged())
                .logDate(request.getLogDate())
                .notes(request.getNotes())
                .build());
        return toDto(saved);
    }

    @Override
    @Transactional
    public WorkLogResponseDto updateWorkLog(Long id, WorkLogRequestDto request) {
        WorkLog log = workLogRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Work log not found: " + id));
        if (request.getHoursLogged() != null) log.setHoursLogged(request.getHoursLogged());
        if (request.getLogDate() != null) log.setLogDate(request.getLogDate());
        if (request.getNotes() != null) log.setNotes(request.getNotes());
        return toDto(workLogRepository.save(log));
    }

    @Override
    @Transactional
    public void deleteWorkLog(Long id) {
        if (!workLogRepository.existsById(id)) {
            throw new ResourceNotFoundException("Work log not found: " + id);
        }
        workLogRepository.deleteById(id);
    }

    private WorkLogResponseDto toDto(WorkLog log) {
        WorkLogResponseDto dto = new WorkLogResponseDto();
        dto.setId(log.getId());
        dto.setTaskId(log.getTaskId());
        dto.setUserId(log.getUserId());
        dto.setHoursLogged(log.getHoursLogged());
        dto.setLogDate(log.getLogDate());
        dto.setNotes(log.getNotes());
        dto.setCreatedAt(log.getCreatedAt());
        taskRepository.findById(log.getTaskId())
                .ifPresent(t -> dto.setTaskNo(t.getTaskNo()));
        userRepository.findById(log.getUserId())
                .ifPresent(u -> dto.setUserName(u.getFullName()));
        return dto;
    }
}
