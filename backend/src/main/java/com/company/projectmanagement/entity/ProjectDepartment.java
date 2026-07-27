package com.company.projectmanagement.entity;

import com.company.projectmanagement.entity.id.ProjectDepartmentId;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.ForeignKey;
import jakarta.persistence.Id;
import jakarta.persistence.IdClass;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "project_departments", schema = "tracker")
@IdClass(ProjectDepartmentId.class)
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProjectDepartment {

    @Id
    @Column(name = "project_id", nullable = false)
    private Long projectId;

    @Id
    @Column(name = "department_id", nullable = false)
    private Long departmentId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", insertable = false, updatable = false,
            foreignKey = @ForeignKey(name = "project_departments_project_fk"))
    private Project project;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id", insertable = false, updatable = false,
            foreignKey = @ForeignKey(name = "project_departments_department_fk"))
    private Department department;
}
