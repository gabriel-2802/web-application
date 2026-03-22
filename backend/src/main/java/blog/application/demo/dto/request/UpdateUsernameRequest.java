package blog.application.demo.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record UpdateUsernameRequest(
    @NotNull(message = "New username is required and cannot be null")
    @NotBlank(message = "New username cannot be blank or empty")
    @Size(min = 3, max = 50, message = "Username must be between 3 and 50 characters")
    String newUsername
) {}

