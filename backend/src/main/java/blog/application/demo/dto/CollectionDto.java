package blog.application.demo.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;
import java.util.List;

public record CollectionDto(
        Long id,
        @NotNull(message = "Collection name is required and cannot be null")
        @NotBlank(message = "Collection name cannot be blank or empty")
        String name,
        @NotNull(message = "Collection description is required and cannot be null")
        @NotBlank(message = "Collection description cannot be blank or empty")
        String description,
        String owner,
        String ownerId,
        @NotNull(message = "Pinned status is required")
        Boolean pinned,
        LocalDateTime createAt,
        List<PostDto> posts) {
}
