package com.company.projectmanagement.entity.id;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProjectDepartmentId implements Serializable {
    private Long projectId;
    private Long departmentId;
}
