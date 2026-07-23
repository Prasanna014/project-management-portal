package com.company.projectmanagement.service;

import com.company.projectmanagement.dto.TaskAttachmentDto;
import com.company.projectmanagement.entity.TaskAttachment;
import com.company.projectmanagement.repository.TaskAttachmentRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.*;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AttachmentService {

    private final TaskAttachmentRepository repository;

    private final String UPLOAD_DIR = "uploads/";

    public List<TaskAttachmentDto> getAttachmentsByTaskId(Long taskId) {
        return repository.findByTaskId(taskId)
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public TaskAttachmentDto getAttachmentById(Long attachmentId) {
        TaskAttachment attachment = repository.findById(attachmentId)
                .orElseThrow(() -> new RuntimeException("Attachment not found"));
        return mapToDto(attachment);
    }

    public TaskAttachmentDto uploadAttachment(Long taskId, MultipartFile file, Long uploadedBy) {
        try {
            String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
            String filePath = UPLOAD_DIR + fileName;

            Files.createDirectories(Paths.get(UPLOAD_DIR));
            Files.copy(file.getInputStream(), Paths.get(filePath), StandardCopyOption.REPLACE_EXISTING);

            TaskAttachment entity = TaskAttachment.builder()
                    .taskId(taskId)
                    .fileName(file.getOriginalFilename())
                    .fileType(file.getContentType())
                    .filePath(filePath)
                    .uploadedBy(uploadedBy)
                    .build();

            TaskAttachment saved = repository.save(entity);
            return mapToDto(saved);

        } catch (Exception e) {
            throw new RuntimeException("File upload failed", e);
        }
    }

    public byte[] downloadAttachment(Long attachmentId) {
        try {
            TaskAttachment attachment = repository.findById(attachmentId)
                    .orElseThrow(() -> new RuntimeException("Attachment not found"));

            return Files.readAllBytes(Paths.get(attachment.getFilePath()));

        } catch (Exception e) {
            throw new RuntimeException("File download failed", e);
        }
    }

    public void deleteAttachment(Long attachmentId) {
        try {
            TaskAttachment attachment = repository.findById(attachmentId)
                    .orElseThrow(() -> new RuntimeException("Attachment not found"));

            Files.deleteIfExists(Paths.get(attachment.getFilePath()));
            repository.delete(attachment);

        } catch (Exception e) {
            throw new RuntimeException("File delete failed", e);
        }
    }

    private TaskAttachmentDto mapToDto(TaskAttachment a) {
        return TaskAttachmentDto.builder()
                .id(a.getId())
                .taskId(a.getTaskId())
                .fileName(a.getFileName())
                .fileType(a.getFileType())
                .filePath(a.getFilePath())
                .uploadedBy(a.getUploadedBy())
                .uploadedAt(a.getUploadedAt())
                .build();
    }
}
