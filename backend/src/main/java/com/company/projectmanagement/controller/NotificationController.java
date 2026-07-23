// ================= NotificationController.java =================
package com.company.projectmanagement.controller;

import com.company.projectmanagement.dto.NotificationDto;
import com.company.projectmanagement.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService service;

    /* ================= GET ALL ================= */
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<NotificationDto>> getNotifications(@PathVariable Long userId) {
        return ResponseEntity.ok(service.getNotifications(userId));
    }

    /* ================= GET UNREAD ================= */
    @GetMapping("/user/{userId}/unread")
    public ResponseEntity<List<NotificationDto>> getUnread(@PathVariable Long userId) {
        return ResponseEntity.ok(service.getUnreadNotifications(userId));
    }

    /* ================= MARK ONE ================= */
    @PutMapping("/{notificationId}/read")
    public ResponseEntity<Void> markAsRead(@PathVariable Long notificationId) {
        service.markAsRead(notificationId);
        return ResponseEntity.ok().build();
    }

    /* ================= MARK ALL ================= */
    @PutMapping("/user/{userId}/read-all")
    public ResponseEntity<Void> markAll(@PathVariable Long userId) {
        service.markAllAsRead(userId);
        return ResponseEntity.ok().build();
    }

    /* ================= CREATE ================= */
    @PostMapping
    public ResponseEntity<NotificationDto> create(@RequestBody NotificationDto dto) {
        return ResponseEntity.ok(service.createNotification(dto));
    }
}
