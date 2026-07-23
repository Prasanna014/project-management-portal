// ================= NotificationService.java =================
package com.company.projectmanagement.service;

import com.company.projectmanagement.dto.NotificationDto;
import com.company.projectmanagement.entity.Notification;
import com.company.projectmanagement.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository repository;

    /* ================= GET ALL ================= */
    public List<NotificationDto> getNotifications(Long userId) {
        return repository.findByUserIdOrderByIsReadAscCreatedAtDesc(userId)
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    /* ================= GET UNREAD ================= */
    public List<NotificationDto> getUnreadNotifications(Long userId) {
        return repository.findByUserIdAndIsReadFalse(userId)
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    /* ================= MARK ONE ================= */
    public void markAsRead(Long notificationId) {
        Notification notification = repository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));

        notification.setIsRead(true);
        repository.save(notification);
    }

    /* ================= MARK ALL ================= */
    public void markAllAsRead(Long userId) {
        List<Notification> list = repository.findByUserIdAndIsReadFalse(userId);

        list.forEach(n -> n.setIsRead(true));
        repository.saveAll(list);
    }

    /* ================= CREATE ================= */
    public NotificationDto createNotification(NotificationDto dto) {

        Notification entity = Notification.builder()
                .userId(dto.getUserId())
                .taskId(dto.getTaskId())
                .title(dto.getTitle())
                .message(dto.getMessage())
                .notificationType(dto.getNotificationType())
                .build();

        Notification saved = repository.save(entity);
        return mapToDto(saved);
    }

    /* ================= MAPPER ================= */
    private NotificationDto mapToDto(Notification n) {
        return NotificationDto.builder()
                .id(n.getId())
                .userId(n.getUserId())
                .taskId(n.getTaskId())
                .title(n.getTitle())
                .message(n.getMessage())
                .notificationType(n.getNotificationType())
                .isRead(n.getIsRead())
                .createdAt(n.getCreatedAt())
                .build();
    }
}
