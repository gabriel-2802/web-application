package blog.application.demo.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.Set;

public record UserDto(
        Long id,
        @NotNull(message = "Username is required and cannot be null")
        @NotBlank(message = "Username cannot be blank or empty")
        String username,
        @NotNull(message = "Email is required and cannot be null")
        @Email(message = "Email must be in a valid format (e.g., user@example.com)")
        String email,
        Set<String> roles) { }
