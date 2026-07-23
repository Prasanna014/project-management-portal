package com.company.projectmanagement.controller;

import com.company.projectmanagement.dto.TaskAttachmentDto;
import com.company.projectmanagement.service.AttachmentService;

import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/attachments")
@RequiredArgsConstructor
public class AttachmentController {

    private final AttachmentService service;

    @GetMapping("/task/{taskId}")
    public ResponseEntity<List<TaskAttachmentDto>> getAttachments(@PathVariable Long taskId) {
        return ResponseEntity.ok(service.getAttachmentsByTaskId(taskId));
    }

    @PostMapping("/task/{taskId}")
    public ResponseEntity<TaskAttachmentDto> upload(
            @PathVariable Long taskId,
            @RequestParam("file") MultipartFile file
    ) {
        return ResponseEntity.ok(service.uploadAttachment(taskId, file));
    }

    @GetMapping("/{attachmentId}/download")
    public ResponseEntity<byte[]> download(@PathVariable Long attachmentId) {

        byte[] fileData = service.downloadAttachment(attachmentId);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=file")
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(fileData);
    }

    @DeleteMapping("/{attachmentId}")
    public ResponseEntity<Void> delete(@PathVariable Long attachmentId) {
        service.deleteAttachment(attachmentId);
        return ResponseEntity.noContent().build();
    }
}
