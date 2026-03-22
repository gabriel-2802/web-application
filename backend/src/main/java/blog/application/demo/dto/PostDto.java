package blog.application.demo.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;
import java.util.List;

public record PostDto(
    Long id,
    @NotNull(message = "Post title is required and cannot be null")
    @NotBlank(message = "Post title cannot be blank or empty")
    String title,
    @NotNull(message = "Post content is required and cannot be null")
    @NotBlank(message = "Post content cannot be blank or empty")
    String content,
    String imageUrl,
    LocalDateTime createdAt,
    LocalDateTime updatedAt,
    Long authorId,
    String authorUsername,
    Long collectionId,
    List<CommentDto> comments
) { }
