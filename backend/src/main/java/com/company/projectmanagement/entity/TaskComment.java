// ================= TaskComment.java =================
package com.company.projectmanagement.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "task_comments", schema = "tracker")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TaskComment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "task_id", nullable = false)
    private Long taskId;

    @Column(name = "comment_text", columnDefinition = "TEXT", nullable = false)
    private String commentText;

    @Column(name = "commented_by", nullable = false)
    private Long commentedBy;

    @Column(name = "commented_at", nullable = false, updatable = false)
    private LocalDateTime commentedAt;

    @PrePersist
    public void prePersist() {
        this.commentedAt = LocalDateTime.now();
    }
}
