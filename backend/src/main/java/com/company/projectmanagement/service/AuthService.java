package com.company.projectmanagement.service;

import com.company.projectmanagement.dto.AuthLoginRequestDto;
import com.company.projectmanagement.dto.AuthTokenResponseDto;
import com.company.projectmanagement.dto.ChangePasswordRequestDto;

public interface AuthService {

    AuthTokenResponseDto login(AuthLoginRequestDto request);

    void changePassword(ChangePasswordRequestDto request);
}
