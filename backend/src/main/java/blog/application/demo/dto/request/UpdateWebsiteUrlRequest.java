package blog.application.demo.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record UpdateWebsiteUrlRequest(
    @NotNull(message = "Website URL is required and cannot be null")
    @Size(max = 1000, message = "Website URL cannot exceed 1000 characters")
    String websiteUrl
) {}

