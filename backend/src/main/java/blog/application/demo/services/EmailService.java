package blog.application.demo.services;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

/**
 * Service for handling email operations using MailTrap
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.from}")
    private String fromEmail;

    @Value("${app.frontend.url}")
    private String frontendUrl;

    /**
     * Send email verification link to user
     * @param userEmail recipient email
     * @param verificationToken unique verification token
     * @param username user's username
     */
    public void sendVerificationEmail(String userEmail, String verificationToken, String username) {
        try {
            String verificationLink = String.format(
                    "%s/verify-email?token=%s",
                    frontendUrl,
                    verificationToken
            );

            String emailBody = buildVerificationEmailBody(username, verificationLink);

            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(userEmail);
            message.setSubject("Email Verification - Blogging Application");
            message.setText(emailBody);

            mailSender.send(message);
            log.info("Verification email sent successfully to: {}", userEmail);
        } catch (Exception e) {
            log.error("Failed to send verification email to: {}", userEmail, e);
            throw new RuntimeException("Failed to send verification email", e);
        }
    }

    /**
     * Send welcome email after successful verification
     * @param userEmail recipient email
     * @param username user's username
     */
    public void sendWelcomeEmail(String userEmail, String username) {
        try {
            String emailBody = buildWelcomeEmailBody(username);

            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(userEmail);
            message.setSubject("Welcome to Blogging Application!");
            message.setText(emailBody);

            mailSender.send(message);
            log.info("Welcome email sent successfully to: {}", userEmail);
        } catch (Exception e) {
            log.error("Failed to send welcome email to: {}", userEmail, e);
            throw new RuntimeException("Failed to send welcome email", e);
        }
    }

    /**
     * Build email body for verification email
     */
    private String buildVerificationEmailBody(String username, String verificationLink) {
        return String.format(
                "Hello %s,\n\n" +
                "Thank you for registering with our Blogging Application!\n\n" +
                "To complete your registration and activate your account, please click the link below:\n" +
                "%s\n\n" +
                "This link will expire in 24 hours.\n\n" +
                "If you did not create this account, please ignore this email.\n\n" +
                "Best regards,\n" +
                "Blogging Application Team",
                username,
                verificationLink
        );
    }

    /**
     * Build email body for welcome email
     */
    private String buildWelcomeEmailBody(String username) {
        return String.format(
                "Hello %s,\n\n" +
                "Welcome to our Blogging Application! Your email has been verified and your account is now active.\n\n" +
                "Best regards,\n" +
                "Blogging Application Team",
                username
        );
    }
}

