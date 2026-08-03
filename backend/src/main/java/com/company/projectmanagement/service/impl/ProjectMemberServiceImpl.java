package com.company.projectmanagement.service.impl;

import com.company.projectmanagement.controller.ApiListQueryHelper;
import com.company.projectmanagement.dto.ProjectMemberRequestDto;
import com.company.projectmanagement.dto.ProjectMemberResponseDto;
import com.company.projectmanagement.entity.ProjectMember;
import com.company.projectmanagement.exception.BadRequestException;
import com.company.projectmanagement.exception.ResourceNotFoundException;
import com.company.projectmanagement.repository.ProjectMemberRepository;
import com.company.projectmanagement.repository.ProjectRepository;
import com.company.projectmanagement.repository.UserRepository;
import com.company.projectmanagement.service.ProjectMemberService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProjectMemberServiceImpl implements ProjectMemberService {

    private final ProjectMemberRepository memberRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;

    @Override
    public Map<String, Object> getProjectMembers(Long projectId, String keyword, Boolean active,
                                                  String sortBy, String sortDir, int page, int size) {
        List<ProjectMemberResponseDto> all = projectId != null
                ? memberRepository.findByProjectId(projectId).stream().map(this::toDto).collect(Collectors.toList())
                : memberRepository.findAll().stream().map(this::toDto).collect(Collectors.toList());

        return ApiListQueryHelper.filterSortPaginate(all, keyword, active, sortBy, sortDir, page, size,
                m -> (m.getProjectName() != null ? m.getProjectName() : "") + " " + (m.getUserName() != null ? m.getUserName() : ""),
                ProjectMemberResponseDto::getActive);
    }

    @Override
    public List<ProjectMemberResponseDto> getMembersByProject(Long projectId) {
        return memberRepository.findByProjectId(projectId).stream().map(this::toDto).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public ProjectMemberResponseDto addProjectMember(ProjectMemberRequestDto request) {
        projectRepository.findById(request.getProjectId())
                .orElseThrow(() -> new ResourceNotFoundException("Project not found: " + request.getProjectId()));
        userRepository.findById(request.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + request.getUserId()));

        if (memberRepository.existsByProjectIdAndUserId(request.getProjectId(), request.getUserId())) {
            throw new BadRequestException("User is already a member of this project.");
        }

        ProjectMember saved = memberRepository.save(ProjectMember.builder()
                .projectId(request.getProjectId())
                .userId(request.getUserId())
                .memberRole(request.getMemberRole() != null ? request.getMemberRole() : "MEMBER")
                .active(request.getActive() != null ? request.getActive() : true)
                .build());
        return toDto(saved);
    }

    @Override
    @Transactional
    public ProjectMemberResponseDto updateProjectMember(Long id, ProjectMemberRequestDto request) {
        ProjectMember member = memberRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Project member not found: " + id));
        if (request.getMemberRole() != null) member.setMemberRole(request.getMemberRole());
        if (request.getActive() != null) member.setActive(request.getActive());
        return toDto(memberRepository.save(member));
    }

    @Override
    @Transactional
    public void removeProjectMember(Long id) {
        if (!memberRepository.existsById(id)) {
            throw new ResourceNotFoundException("Project member not found: " + id);
        }
        memberRepository.deleteById(id);
    }

    private ProjectMemberResponseDto toDto(ProjectMember m) {
        ProjectMemberResponseDto dto = new ProjectMemberResponseDto();
        dto.setId(m.getId());
        dto.setProjectId(m.getProjectId());
        dto.setUserId(m.getUserId());
        dto.setMemberRole(m.getMemberRole());
        dto.setActive(m.getActive());
        dto.setCreatedAt(m.getCreatedAt());
        dto.setUpdatedAt(m.getUpdatedAt());

        projectRepository.findById(m.getProjectId())
                .ifPresent(p -> dto.setProjectName(p.getProjectName()));
        userRepository.findById(m.getUserId())
                .ifPresent(u -> dto.setUserName(u.getFullName()));
        return dto;
    }
}
