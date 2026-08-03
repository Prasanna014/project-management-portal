package com.company.projectmanagement.service;

import com.company.projectmanagement.dto.WorkLogRequestDto;
import com.company.projectmanagement.dto.WorkLogResponseDto;

import java.util.Map;

public interface WorkLogService {
    Map<String, Object> getWorkLogs(Long taskId, Long userId, String keyword,
                                    String sortBy, String sortDir, int page, int size);
    WorkLogResponseDto getById(Long id);
    WorkLogResponseDto createWorkLog(WorkLogRequestDto request);
    WorkLogResponseDto updateWorkLog(Long id, WorkLogRequestDto request);
    void deleteWorkLog(Long id);
}
