package blog.application.demo.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record UpdatePasswordRequest(
    @NotNull(message = "Current password is required and cannot be null")
    @NotBlank(message = "Current password cannot be blank or empty")
    String currentPassword,
    
    @NotNull(message = "New password is required and cannot be null")
    @NotBlank(message = "New password cannot be blank or empty")
    @Size(min = 6, message = "New password must be at least 6 characters long")
    String newPassword,
    
    @NotNull(message = "Password confirmation is required and cannot be null")
    @NotBlank(message = "Password confirmation cannot be blank or empty")
    String confirmPassword
) {}

