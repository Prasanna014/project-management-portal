package com.company.projectmanagement.service;

import com.company.projectmanagement.controller.ApiListQueryHelper;
import com.company.projectmanagement.dto.KnowledgeDocumentDto;
import com.company.projectmanagement.dto.KnowledgeDocumentUpdateRequestDto;
import com.company.projectmanagement.entity.KnowledgeDocument;
import com.company.projectmanagement.entity.User;
import com.company.projectmanagement.exception.BadRequestException;
import com.company.projectmanagement.exception.ResourceNotFoundException;
import com.company.projectmanagement.repository.KnowledgeDocumentRepository;
import com.company.projectmanagement.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class KnowledgeBaseService {

    private static final String AUDIT_ENTITY_TYPE = "KNOWLEDGE_DOCUMENT";
    private static final int USER_RESTORE_WINDOW_DAYS = 30;
    private static final int ADMIN_RESTORE_WINDOW_DAYS = 60;

    private final KnowledgeDocumentRepository repository;
    private final UserRepository userRepository;
    private final AuditLogService auditLogService;

    @Value("${app.knowledge-base.storage-dir:uploads/knowledge-base}")
    private String storageDir;

    public Map<String, Object> listDocuments(
            String keyword,
            String sortBy,
            String sortDir,
            int page,
            int size,
            boolean includeDeleted,
            boolean deletedOnly,
            boolean uploadedByMeOnly,
            Long currentUserId,
            boolean admin
    ) {
        List<KnowledgeDocumentDto> allDocuments = repository.findAll().stream()
                .filter(document -> document.getPurgedAt() == null)
                .filter(document -> {
                    if (deletedOnly) {
                        return document.getDeletedAt() != null;
                    }
                    if (includeDeleted) {
                        return true;
                    }
                    return document.getDeletedAt() == null;
                })
                .filter(document -> !uploadedByMeOnly || Objects.equals(document.getUploadedBy(), currentUserId) || Objects.equals(document.getDeletedBy(), currentUserId))
                .filter(document -> admin || document.getDeletedAt() == null || Objects.equals(document.getDeletedBy(), currentUserId))
                .sorted(Comparator.comparing(KnowledgeDocument::getCreatedAt).reversed())
                .map(this::mapToDto)
                .collect(Collectors.toList());

        return ApiListQueryHelper.filterSortPaginate(
                allDocuments,
                keyword,
                null,
                sortBy,
                sortDir,
                page,
                size,
                document -> String.join(" ",
                        safe(document.getTitle()),
                        safe(document.getCategory()),
                        safe(document.getAudience()),
                        safe(document.getDescription()),
                        safe(document.getFileName()),
                        safe(document.getUploadedByName()),
                        safe(document.getDeletedByName())),
                dto -> true
        );
    }

    public KnowledgeDocumentDto getDocumentById(Long id, Long currentUserId, boolean admin) {
        KnowledgeDocument document = findDocument(id);
        ensureReadable(document, currentUserId, admin);
        return mapToDto(document);
    }

    @Transactional
    public KnowledgeDocumentDto createDocument(
            String title,
            String category,
            String audience,
            String description,
            MultipartFile file,
            Long uploadedBy
    ) {
        validateDocumentMetadata(title, category);
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("Document file is required");
        }
        userRepository.findById(uploadedBy)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + uploadedBy));

        String originalFileName = normalizeFileName(file.getOriginalFilename());
        String extension = extractExtension(originalFileName);
        String storageFileName = UUID.randomUUID() + (extension.isBlank() ? "" : "." + extension);
        Path storagePath = buildStoragePath(storageFileName);

        try {
            Files.createDirectories(storagePath.getParent());
            Files.copy(file.getInputStream(), storagePath, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException ex) {
            throw new IllegalStateException("Failed to store knowledge document", ex);
        }

        KnowledgeDocument document = KnowledgeDocument.builder()
                .title(title.trim())
                .category(category.trim())
                .audience(normalizeNullable(audience))
                .description(normalizeNullable(description))
                .fileName(originalFileName)
                .storageFileName(storageFileName)
                .contentType(normalizeNullable(file.getContentType()))
                .fileExtension(extension)
                .filePath(storagePath.toString())
                .fileSize(file.getSize())
                .uploadedBy(uploadedBy)
                .build();

        KnowledgeDocument saved = repository.save(document);
        auditLogService.record(AUDIT_ENTITY_TYPE, saved.getId(), "DOCUMENT_CREATED", null, describeDocument(saved), uploadedBy,
                "Knowledge document uploaded.");
        return mapToDto(saved);
    }

    @Transactional
    public KnowledgeDocumentDto updateDocument(Long id, KnowledgeDocumentUpdateRequestDto request, Long currentUserId, boolean admin) {
        validateDocumentMetadata(request.getTitle(), request.getCategory());
        KnowledgeDocument document = findDocument(id);
        ensureEditable(document, currentUserId, admin);

        String oldValue = describeDocument(document);
        document.setTitle(request.getTitle().trim());
        document.setCategory(request.getCategory().trim());
        document.setAudience(normalizeNullable(request.getAudience()));
        document.setDescription(normalizeNullable(request.getDescription()));

        KnowledgeDocument saved = repository.save(document);
        auditLogService.record(AUDIT_ENTITY_TYPE, saved.getId(), "DOCUMENT_UPDATED", oldValue, describeDocument(saved), currentUserId,
                "Knowledge document metadata updated.");
        return mapToDto(saved);
    }

    public byte[] downloadDocument(Long id, Long currentUserId, boolean admin) {
        KnowledgeDocument document = findDocument(id);
        ensureReadable(document, currentUserId, admin);
        try {
            return Files.readAllBytes(Path.of(document.getFilePath()));
        } catch (IOException ex) {
            throw new IllegalStateException("Failed to read knowledge document", ex);
        }
    }

    @Transactional
    public void softDeleteDocument(Long id, Long currentUserId, boolean admin) {
        KnowledgeDocument document = findDocument(id);
        ensureEditable(document, currentUserId, admin);
        if (document.getDeletedAt() != null) {
            throw new BadRequestException("Document is already deleted");
        }

        String oldValue = describeDocument(document);
        document.setDeletedAt(LocalDateTime.now());
        document.setDeletedBy(currentUserId);
        KnowledgeDocument saved = repository.save(document);
        auditLogService.record(AUDIT_ENTITY_TYPE, saved.getId(), "DOCUMENT_SOFT_DELETED", oldValue, describeDocument(saved), currentUserId,
                "Knowledge document moved to recycle state.");
    }

    @Transactional
    public KnowledgeDocumentDto restoreDocument(Long id, Long currentUserId, boolean admin) {
        KnowledgeDocument document = findDocument(id);
        if (document.getDeletedAt() == null) {
            throw new BadRequestException("Document is not deleted");
        }

        int allowedDays = admin ? ADMIN_RESTORE_WINDOW_DAYS : USER_RESTORE_WINDOW_DAYS;
        if (!admin && !Objects.equals(document.getDeletedBy(), currentUserId)) {
            throw new BadRequestException("You can restore only documents you deleted.");
        }
        if (document.getDeletedAt().isBefore(LocalDateTime.now().minusDays(allowedDays))) {
            throw new BadRequestException("Restore window has expired for this document.");
        }

        String oldValue = describeDocument(document);
        document.setDeletedAt(null);
        document.setDeletedBy(null);
        KnowledgeDocument saved = repository.save(document);
        auditLogService.record(AUDIT_ENTITY_TYPE, saved.getId(), "DOCUMENT_RESTORED", oldValue, describeDocument(saved), currentUserId,
                admin ? "Administrator restored a deleted document." : "User restored their deleted document.");
        return mapToDto(saved);
    }

    @Transactional
    @Scheduled(cron = "${app.knowledge-base.purge-cron:0 0 2 * * *}")
    public void purgeExpiredDocuments() {
        LocalDateTime threshold = LocalDateTime.now().minusDays(ADMIN_RESTORE_WINDOW_DAYS);
        List<KnowledgeDocument> expiredDocuments = repository.findByDeletedAtBeforeAndPurgedAtIsNull(threshold);

        for (KnowledgeDocument document : expiredDocuments) {
            try {
                Files.deleteIfExists(Path.of(document.getFilePath()));
            } catch (IOException ex) {
                throw new IllegalStateException("Failed to purge knowledge document file: " + document.getId(), ex);
            }
            String oldValue = describeDocument(document);
            repository.delete(document);
            auditLogService.record(AUDIT_ENTITY_TYPE, document.getId(), "DOCUMENT_PURGED", oldValue, null, null,
                    "Expired knowledge document purged after 60-day retention window.");
        }
    }

    private KnowledgeDocument findDocument(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Knowledge document not found: " + id));
    }

    private void ensureReadable(KnowledgeDocument document, Long currentUserId, boolean admin) {
        if (document.getPurgedAt() != null) {
            throw new ResourceNotFoundException("Knowledge document not found: " + document.getId());
        }
        if (document.getDeletedAt() != null && !admin && !Objects.equals(document.getDeletedBy(), currentUserId)) {
            throw new ResourceNotFoundException("Knowledge document not found: " + document.getId());
        }
    }

    private void ensureEditable(KnowledgeDocument document, Long currentUserId, boolean admin) {
        if (document.getDeletedAt() != null) {
            throw new BadRequestException("Deleted documents cannot be edited.");
        }
        if (!admin && !Objects.equals(document.getUploadedBy(), currentUserId)) {
            throw new BadRequestException("You can modify only documents you uploaded.");
        }
    }

    private KnowledgeDocumentDto mapToDto(KnowledgeDocument document) {
        return KnowledgeDocumentDto.builder()
                .id(document.getId())
                .title(document.getTitle())
                .category(document.getCategory())
                .audience(document.getAudience())
                .description(document.getDescription())
                .fileName(document.getFileName())
                .contentType(document.getContentType())
                .fileExtension(document.getFileExtension())
                .fileSize(document.getFileSize())
                .uploadedBy(document.getUploadedBy())
                .uploadedByName(resolveUserName(document.getUploadedBy()))
                .deletedAt(document.getDeletedAt())
                .deletedBy(document.getDeletedBy())
                .deletedByName(resolveUserName(document.getDeletedBy()))
                .purgedAt(document.getPurgedAt())
                .createdAt(document.getCreatedAt())
                .updatedAt(document.getUpdatedAt())
                .build();
    }

    private String resolveUserName(Long userId) {
        if (userId == null) {
            return null;
        }
        User user = userRepository.findById(userId).orElse(null);
        return user != null ? user.getFullName() : null;
    }

    private void validateDocumentMetadata(String title, String category) {
        if (title == null || title.isBlank()) {
            throw new BadRequestException("Title is required");
        }
        if (category == null || category.isBlank()) {
            throw new BadRequestException("Category is required");
        }
    }

    private String normalizeFileName(String originalFileName) {
        String safeName = originalFileName == null ? "" : originalFileName.trim();
        if (safeName.isBlank()) {
            throw new BadRequestException("A valid file name is required");
        }
        return Path.of(safeName).getFileName().toString();
    }

    private String extractExtension(String fileName) {
        int index = fileName.lastIndexOf('.');
        if (index < 0 || index == fileName.length() - 1) {
            return "";
        }
        return fileName.substring(index + 1).toLowerCase();
    }

    private Path buildStoragePath(String storageFileName) {
        return Path.of(storageDir).resolve(storageFileName).normalize();
    }

    private String normalizeNullable(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private String safe(String value) {
        return value == null ? "" : value;
    }

    private String describeDocument(KnowledgeDocument document) {
        return "title=" + document.getTitle()
                + ", category=" + document.getCategory()
                + ", audience=" + document.getAudience()
                + ", fileName=" + document.getFileName()
                + ", fileExtension=" + document.getFileExtension()
                + ", fileSize=" + document.getFileSize()
                + ", uploadedBy=" + document.getUploadedBy()
                + ", deletedAt=" + document.getDeletedAt()
                + ", deletedBy=" + document.getDeletedBy();
    }
}
