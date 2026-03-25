package blog.application.demo.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record UpdateLocationRequest(
    @NotNull(message = "Location is required and cannot be null")
    @Size(max = 500, message = "Location cannot exceed 500 characters")
    String location
) {}

