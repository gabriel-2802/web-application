package blog.application.demo.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record UpdateBioRequest(
    @NotNull(message = "Bio is required and cannot be null")
    @Size(max = 2000, message = "Bio cannot exceed 2000 characters")
    String bio
) {}

