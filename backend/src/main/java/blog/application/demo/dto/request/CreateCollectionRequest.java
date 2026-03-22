package blog.application.demo.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CreateCollectionRequest(
    @NotNull(message = "Collection name is required and cannot be null")
    @NotBlank(message = "Collection name cannot be blank or empty")
    String name,
    
    @NotNull(message = "Collection description is required and cannot be null")
    @NotBlank(message = "Collection description cannot be blank or empty")
    String description,
    
    Boolean pinned
) {}

