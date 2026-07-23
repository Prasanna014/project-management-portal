// ================= UserService.java =================
package com.company.projectmanagement.service;

import com.company.projectmanagement.dto.UserDto;
import com.company.projectmanagement.entity.User;
import com.company.projectmanagement.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository repository;

    /* ================= GET ALL ================= */
    public List<UserDto> getAllUsers() {
        return repository.findAll()
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    /* ================= GET BY ID ================= */
    public UserDto getUserById(Long id) {
        User user = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found: " + id));
        return mapToDto(user);
    }

    /* ================= CREATE ================= */
    public UserDto createUser(UserDto dto) {

        repository.findByEmail(dto.getEmail())
                .ifPresent(u -> { throw new RuntimeException("Email already exists"); });

        repository.findByEmployeeId(dto.getEmployeeId())
                .ifPresent(u -> { throw new RuntimeException("Employee ID already exists"); });

        User entity = mapToEntity(dto);
        User saved = repository.save(entity);

        return mapToDto(saved);
    }

    /* ================= UPDATE ================= */
    public UserDto updateUser(Long id, UserDto dto) {

        User existing = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found: " + id));

        existing.setEmployeeId(dto.getEmployeeId());
        existing.setFullName(dto.getFullName());
        existing.setEmail(dto.getEmail());
        existing.setRole(dto.getRole());
        existing.setActive(dto.getActive());

        User updated = repository.save(existing);
        return mapToDto(updated);
    }

    /* ================= DELETE ================= */
    public void deleteUser(Long id) {
        User user = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found: " + id));

        repository.delete(user);
    }

    /* ================= ACTIVE USERS ================= */
    public List<UserDto> getActiveUsers() {
        return repository.findByActive(true)
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    /* ================= MAPPER ================= */
    private UserDto mapToDto(User u) {
        return UserDto.builder()
                .id(u.getId())
                .employeeId(u.getEmployeeId())
                .fullName(u.getFullName())
                .email(u.getEmail())
                .role(u.getRole())
                .active(u.getActive())
                .createdAt(u.getCreatedAt())
                .updatedAt(u.getUpdatedAt())
                .build();
    }

    private User mapToEntity(UserDto dto) {
        return User.builder()
                .id(dto.getId())
                .employeeId(dto.getEmployeeId())
                .fullName(dto.getFullName())
                .email(dto.getEmail())
                .role(dto.getRole())
                .active(dto.getActive())
                .createdAt(dto.getCreatedAt())
                .updatedAt(dto.getUpdatedAt())
                .build();
    }
}
