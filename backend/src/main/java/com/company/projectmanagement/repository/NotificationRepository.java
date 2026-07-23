// ================= NotificationRepository.java =================
package com.company.projectmanagement.repository;

import com.company.projectmanagement.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    List<Notification> findByUserIdOrderByIsReadAscCreatedAtDesc(Long userId);

    List<Notification> findByUserIdAndIsReadFalse(Long userId);
}
