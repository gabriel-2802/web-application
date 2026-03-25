package blog.application.demo.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record UpdateProfileImageUrlRequest(
    @NotNull(message = "Profile image URL is required and cannot be null")
    @Size(max = 1000, message = "Profile image URL cannot exceed 1000 characters")
    String profileImageUrl
) {}

