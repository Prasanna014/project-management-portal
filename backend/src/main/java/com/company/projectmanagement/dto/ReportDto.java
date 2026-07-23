// ================= ReportDto.java =================
package com.company.projectmanagement.dto;

import lombok.*;

import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReportDto {

    private String reportName;

    private Long totalCount;

    private Map<String, Long> data; // flexible structure for charts / breakdown
}
