package blog.application.demo.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record UpdateEmailRequest(
    @NotNull(message = "New email is required and cannot be null")
    @Email(message = "Email must be in a valid format (e.g., user@example.com)")
    String newEmail
) {}

