package com.company.projectmanagement.controller;

import com.company.projectmanagement.dto.KnowledgeDocumentDto;
import com.company.projectmanagement.dto.KnowledgeDocumentUpdateRequestDto;
import com.company.projectmanagement.security.SecurityUserPrincipal;
import com.company.projectmanagement.service.KnowledgeBaseService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;
import java.util.Set;

@RestController
@RequestMapping("/api/knowledge-base/documents")
@RequiredArgsConstructor
public class KnowledgeBaseController {

    private static final Set<String> KNOWLEDGE_BASE_ADMIN_AUTHORITIES = Set.of(
            "*",
            "ALL",
            "ALL_PERMISSIONS",
            "ADMIN",
            "ROLE_ADMIN",
            "GLOBAL_ADMIN",
            "ROLE_GLOBAL_ADMIN"
    );

    private final KnowledgeBaseService service;

    @GetMapping
    public ResponseEntity<Map<String, Object>> listDocuments(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "false") boolean includeDeleted,
            @RequestParam(defaultValue = "false") boolean deletedOnly,
            @RequestParam(defaultValue = "false") boolean uploadedByMeOnly
    ) {
        SecurityUserPrincipal principal = getCurrentPrincipal();
        Long currentUserId = principal != null ? principal.userId() : null;
        boolean admin = principal != null && hasAdminAccess(principal);
        return ResponseEntity.ok(service.listDocuments(keyword, sortBy, sortDir, page, size, includeDeleted, deletedOnly, uploadedByMeOnly, currentUserId, admin));
    }

    @GetMapping("/{id}")
    public ResponseEntity<KnowledgeDocumentDto> getDocument(@PathVariable Long id) {
        SecurityUserPrincipal principal = getCurrentPrincipal();
        Long currentUserId = principal != null ? principal.userId() : null;
        boolean admin = principal != null && hasAdminAccess(principal);
        return ResponseEntity.ok(service.getDocumentById(id, currentUserId, admin));
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<KnowledgeDocumentDto> uploadDocument(
            @RequestPart("file") MultipartFile file,
            @RequestParam("title") String title,
            @RequestParam("category") String category,
            @RequestParam(value = "audience", required = false) String audience,
            @RequestParam(value = "description", required = false) String description
    ) {
        SecurityUserPrincipal principal = requireCurrentPrincipal();
        return ResponseEntity.ok(service.createDocument(title, category, audience, description, file, principal.userId()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<KnowledgeDocumentDto> updateDocument(
            @PathVariable Long id,
            @Valid @RequestBody KnowledgeDocumentUpdateRequestDto request
    ) {
        SecurityUserPrincipal principal = requireCurrentPrincipal();
        return ResponseEntity.ok(service.updateDocument(id, request, principal.userId(), hasAdminAccess(principal)));
    }

    @GetMapping("/{id}/download")
    public ResponseEntity<byte[]> downloadDocument(@PathVariable Long id) {
        SecurityUserPrincipal principal = getCurrentPrincipal();
        Long currentUserId = principal != null ? principal.userId() : null;
        boolean admin = principal != null && hasAdminAccess(principal);
        KnowledgeDocumentDto document = service.getDocumentById(id, currentUserId, admin);
        byte[] fileData = service.downloadDocument(id, currentUserId, admin);
        MediaType contentType = MediaType.APPLICATION_OCTET_STREAM;
        if (document.getContentType() != null && !document.getContentType().isBlank()) {
            try {
                contentType = MediaType.parseMediaType(document.getContentType());
            } catch (IllegalArgumentException ignored) {
                contentType = MediaType.APPLICATION_OCTET_STREAM;
            }
        }

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + document.getFileName() + "\"")
                .contentType(contentType)
                .body(fileData);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> softDeleteDocument(@PathVariable Long id) {
        SecurityUserPrincipal principal = requireCurrentPrincipal();
        service.softDeleteDocument(id, principal.userId(), hasAdminAccess(principal));
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/restore")
    public ResponseEntity<KnowledgeDocumentDto> restoreDocument(@PathVariable Long id) {
        SecurityUserPrincipal principal = requireCurrentPrincipal();
        return ResponseEntity.ok(service.restoreDocument(id, principal.userId(), hasAdminAccess(principal)));
    }

    private SecurityUserPrincipal getCurrentPrincipal() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof SecurityUserPrincipal principal) {
            return principal;
        }
        return null;
    }

    private SecurityUserPrincipal requireCurrentPrincipal() {
        SecurityUserPrincipal principal = getCurrentPrincipal();
        if (principal == null) {
            throw new IllegalStateException("Authenticated user is required");
        }
        return principal;
    }

    private boolean hasAdminAccess(SecurityUserPrincipal principal) {
        return principal.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .map(this::normalizeAuthority)
                .anyMatch(KNOWLEDGE_BASE_ADMIN_AUTHORITIES::contains);
    }

    private String normalizeAuthority(String value) {
        return value == null ? "" : value.trim().toUpperCase().replaceAll("[\\s\\-./:]+", "_");
    }
}
