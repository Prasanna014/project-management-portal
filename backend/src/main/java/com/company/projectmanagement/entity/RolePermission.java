package com.company.projectmanagement.entity;

import com.company.projectmanagement.entity.id.RolePermissionId;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.ForeignKey;
import jakarta.persistence.Id;
import jakarta.persistence.IdClass;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "role_permissions", schema = "tracker")
@IdClass(RolePermissionId.class)
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RolePermission {

    @Id
    @Column(name = "role_id", nullable = false)
    private Long roleId;

    @Id
    @Column(name = "permission_id", nullable = false)
    private Long permissionId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "role_id", insertable = false, updatable = false,
            foreignKey = @ForeignKey(name = "role_permissions_role_fk"))
    private Role role;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "permission_id", insertable = false, updatable = false,
            foreignKey = @ForeignKey(name = "role_permissions_permission_fk"))
    private Permission permission;

    @Column(name = "granted_by")
    private Long grantedBy;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "granted_by", insertable = false, updatable = false,
            foreignKey = @ForeignKey(name = "role_permissions_granted_by_fk"))
    private User grantedByUser;

    @NotNull
    @Column(name = "granted_at", nullable = false)
    private LocalDateTime grantedAt;

    @PrePersist
    public void prePersist() {
        if (this.grantedAt == null) {
            this.grantedAt = LocalDateTime.now();
        }
    }
}
