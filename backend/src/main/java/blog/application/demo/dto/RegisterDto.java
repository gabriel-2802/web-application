package blog.application.demo.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record RegisterDto(
        @NotNull(message = "Username is required and cannot be null")
        @NotBlank(message = "Username cannot be blank or empty")
        @Size(min = 3, max = 50, message = "Username must be between 3 and 50 characters")
        String username,
        @NotNull(message = "Email is required and cannot be null")
        @Email(message = "Email must be in a valid format (e.g., user@example.com)")
        String email,
        @NotNull(message = "Password is required and cannot be null")
        @NotBlank(message = "Password cannot be blank or empty")
        @Size(min = 6, message = "Password must be at least 6 characters long")
        String password,
        Long adminRegisterCode
) {}