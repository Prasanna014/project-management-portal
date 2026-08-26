// ================= UserController.java =================
package com.company.projectmanagement.controller;

import com.company.projectmanagement.dto.UserDto;
import com.company.projectmanagement.dto.UserStatusUpdateRequestDto;
import com.company.projectmanagement.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService service;

    /* ================= GET ALL ================= */
    @GetMapping
    public ResponseEntity<List<UserDto>> getAllUsers() {
        return ResponseEntity.ok(service.getAllUsers());
    }

    /* ================= GET BY ID ================= */
    @GetMapping("/{id}")
    public ResponseEntity<UserDto> getUserById(@PathVariable Long id) {
        return ResponseEntity.ok(service.getUserById(id));
    }

    /* ================= CREATE ================= */
    @PostMapping
    public ResponseEntity<UserDto> createUser(@Valid @RequestBody UserDto dto) {
        return ResponseEntity.ok(service.createUser(dto));
    }

    /* ================= UPDATE ================= */
    @PutMapping("/{id}")
    public ResponseEntity<UserDto> updateUser(
            @PathVariable Long id,
                @Valid @RequestBody UserDto dto
    ) {
        return ResponseEntity.ok(service.updateUser(id, dto));
    }

    /* ================= DELETE ================= */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        service.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

    /* ================= ACTIVE USERS ================= */
    @GetMapping("/active")
    public ResponseEntity<List<UserDto>> getActiveUsers() {
        return ResponseEntity.ok(service.getActiveUsers());
    }

    @PostMapping("/{id}/resend-invite")
    public ResponseEntity<UserDto> resendInvite(@PathVariable Long id) {
        return ResponseEntity.ok(service.resendInvite(id));
    }

    @PostMapping("/{id}/admin-reset-password")
    public ResponseEntity<UserDto> adminResetPassword(@PathVariable Long id) {
        return ResponseEntity.ok(service.adminResetPassword(id));
    }

    @PostMapping("/{id}/status")
    public ResponseEntity<UserDto> updateAccountStatus(
            @PathVariable Long id,
            @Valid @RequestBody UserStatusUpdateRequestDto request
    ) {
        return ResponseEntity.ok(service.updateAccountStatus(id, request.getAccountStatus()));
    }
}
