// ================= EmailService.java =================
package com.company.projectmanagement.service;

import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    private static final String SUBJECT_PREFIX = "[Project Tracker] ";

    private void sendEmail(String to, String subject, String body) {

        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject(SUBJECT_PREFIX + subject);
        message.setText(body);

        mailSender.send(message);
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
}

