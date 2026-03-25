package blog.application.demo.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record UpdateProfessionalTitleRequest(
    @NotNull(message = "Professional title is required and cannot be null")
    @Size(max = 500, message = "Professional title cannot exceed 500 characters")
    String professionalTitle
) {}

