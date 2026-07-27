package com.company.projectmanagement.entity.id;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class WorkflowTransitionRoleId implements Serializable {
    private Long transitionId;
    private Long roleId;
}
