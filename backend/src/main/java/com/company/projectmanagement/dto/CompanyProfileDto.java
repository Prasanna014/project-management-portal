package com.company.projectmanagement.dto;

import lombok.Data;

@Data
public class CompanyProfileDto {
    private Long id;
    private String companyName;
    private String tradingName;
    private String registrationNumber;
    private String industry;
    private String logoUrl;
    private String defaultTimezone;
    private String addressLine1;
    private String addressLine2;
    private String city;
    private String state;
    private String country;
    private String phone;
    private String email;
    private String website;
    private Boolean active;
}
