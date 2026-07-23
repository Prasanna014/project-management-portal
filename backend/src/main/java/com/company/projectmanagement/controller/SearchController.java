package com.company.projectmanagement.controller;

import com.company.projectmanagement.dto.TaskDto;
import com.company.projectmanagement.dto.ProjectDto;
import com.company.projectmanagement.service.SearchService;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/search")
@RequiredArgsConstructor
public class SearchController {

    private final SearchService service;

    /* ================= TASK SEARCH ================= */
    @GetMapping("/tasks")
    public ResponseEntity<List<TaskDto>> searchTasks(@RequestParam String keyword) {
        return ResponseEntity.ok(service.searchTasks(keyword));
    }

    /* ================= PROJECT SEARCH ================= */
    @GetMapping("/projects")
    public ResponseEntity<List<ProjectDto>> searchProjects(@RequestParam String keyword) {
        return ResponseEntity.ok(service.searchProjects(keyword));
    }

    /* ================= GLOBAL SEARCH ================= */
    @GetMapping("/global")
    public ResponseEntity<Map<String, Object>> globalSearch(@RequestParam String keyword) {
        return ResponseEntity.ok(service.globalSearch(keyword));
    }
}
