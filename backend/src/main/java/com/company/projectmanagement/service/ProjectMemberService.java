package com.company.projectmanagement.service;

import com.company.projectmanagement.dto.ProjectMemberRequestDto;
import com.company.projectmanagement.dto.ProjectMemberResponseDto;

import java.util.List;
import java.util.Map;

public interface ProjectMemberService {
    Map<String, Object> getProjectMembers(Long projectId, String keyword, Boolean active,
                                          String sortBy, String sortDir, int page, int size);
    List<ProjectMemberResponseDto> getMembersByProject(Long projectId);
    ProjectMemberResponseDto addProjectMember(ProjectMemberRequestDto request);
    ProjectMemberResponseDto updateProjectMember(Long id, ProjectMemberRequestDto request);
    void removeProjectMember(Long id);
}
