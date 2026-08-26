package com.company.projectmanagement.service;

import com.company.projectmanagement.dto.AuthLoginRequestDto;
import com.company.projectmanagement.dto.AuthTokenResponseDto;
import com.company.projectmanagement.dto.ActivateInvitationRequestDto;
import com.company.projectmanagement.dto.ChangePasswordRequestDto;
import com.company.projectmanagement.dto.ForgotPasswordRequestDto;
import com.company.projectmanagement.dto.ResetPasswordWithTokenRequestDto;
import com.company.projectmanagement.dto.UserDto;

public interface AuthService {

    AuthTokenResponseDto login(AuthLoginRequestDto request);

    void changePassword(ChangePasswordRequestDto request);

    UserDto activateInvitation(ActivateInvitationRequestDto request);

    UserDto forgotPassword(ForgotPasswordRequestDto request);

    UserDto resetPasswordWithToken(ResetPasswordWithTokenRequestDto request);
}
