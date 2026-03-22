package blog.application.demo.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record LoginDto(
        @NotNull(message = "Username is required and cannot be null")
        @NotBlank(message = "Username cannot be blank or empty")
        String username,
        @NotNull(message = "Password is required and cannot be null")
        @NotBlank(message = "Password cannot be blank or empty")
        String password
) {}
