package com.company.projectmanagement.repository;

import com.company.projectmanagement.entity.KnowledgeDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface KnowledgeDocumentRepository extends JpaRepository<KnowledgeDocument, Long> {
    List<KnowledgeDocument> findByDeletedAtIsNullAndPurgedAtIsNull();
    List<KnowledgeDocument> findByDeletedAtIsNotNullAndPurgedAtIsNull();
    List<KnowledgeDocument> findByDeletedAtIsNotNullAndDeletedByAndPurgedAtIsNull(Long deletedBy);
    List<KnowledgeDocument> findByDeletedAtBeforeAndPurgedAtIsNull(LocalDateTime threshold);
}
