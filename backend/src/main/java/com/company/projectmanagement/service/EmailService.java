// ================= EmailService.java =================
package com.company.projectmanagement.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    private static final String SUBJECT_PREFIX = "[Project Tracker] ";
    private static final DateTimeFormatter DATE_TIME_FORMATTER = DateTimeFormatter.ofPattern("dd MMM yyyy HH:mm");

    @Value("${spring.mail.host:}")
    private String mailHost;

    @Value("${app.mail-from:noreply@supportflow.local}")
    private String fromAddress;

    public boolean isConfigured() {
        return mailHost != null && !mailHost.isBlank();
    }

    private boolean sendEmail(String to, String subject, String body) {
        if (!isConfigured()) {
            return false;
        }

        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setFrom(fromAddress);
        message.setSubject(SUBJECT_PREFIX + subject);
        message.setText(body);

        mailSender.send(message);
        return true;
    }

    /* ================= TASK CREATED ================= */
    public void sendTaskCreatedEmail(String to, String taskNo) {
        String subject = "Task Created";
        String body = "Task " + taskNo + " has been created successfully.";
        sendEmail(to, subject, body);
    }

    /* ================= TASK ASSIGNED ================= */
    public void sendTaskAssignedEmail(String to, String taskNo) {
        String subject = "Task Assigned";
        String body = "You have been assigned task " + taskNo + ".";
        sendEmail(to, subject, body);
    }

    /* ================= TASK REASSIGNED ================= */
    public void sendTaskReassignedEmail(String to, String taskNo) {
        String subject = "Task Reassigned";
        String body = "Task " + taskNo + " has been reassigned to you.";
        sendEmail(to, subject, body);
    }

    /* ================= TASK COMPLETED ================= */
    public void sendTaskCompletedEmail(String to, String taskNo) {
        String subject = "Task Completed";
        String body = "Task " + taskNo + " has been marked as completed.";
        sendEmail(to, subject, body);
    }

    /* ================= TASK OVERDUE ================= */
    public void sendTaskOverdueEmail(String to, String taskNo) {
        String subject = "Task Overdue";
        String body = "Task " + taskNo + " is overdue. Please take action.";
        sendEmail(to, subject, body);
    }

    public boolean sendUserInvitationEmail(String to, String fullName, String activationLink, LocalDateTime expiresAt) {
        String subject = "Activate your account";
        String body = "Hello " + fullName + ",\n\n"
                + "Your account has been created in the Project Management Portal.\n"
                + "Use the activation link below to set your password and start using the system:\n\n"
                + activationLink + "\n\n"
                + "This link expires on "
                + (expiresAt == null ? "the configured expiry window" : DATE_TIME_FORMATTER.format(expiresAt))
                + ".\n\n"
                + "If you did not expect this invitation, contact your administrator.\n";
        return sendEmail(to, subject, body);
    }

    public boolean sendPasswordResetEmail(String to, String fullName, String resetLink, LocalDateTime expiresAt) {
        String subject = "Reset your password";
        String body = "Hello " + fullName + ",\n\n"
                + "A password reset was requested for your Project Management Portal account.\n"
                + "Use the link below to set a new password:\n\n"
                + resetLink + "\n\n"
                + "This link expires on "
                + (expiresAt == null ? "the configured expiry window" : DATE_TIME_FORMATTER.format(expiresAt))
                + ".\n\n"
                + "If you did not request this change, contact your administrator immediately.\n";
        return sendEmail(to, subject, body);
    }
}
