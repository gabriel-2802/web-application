package blog.application.demo.dto;

import lombok.NonNull;

import javax.validation.constraints.NotBlank;
import java.time.LocalDateTime;
import java.util.List;

public record PostDto(
    Long id,
    @NonNull @NotBlank
    String title,
    @NonNull @NotBlank
    String content,
    String imageUrl,
    LocalDateTime createdAt,
    LocalDateTime updatedAt,
    Long authorId,
    String authorUsername,
    Long collectionId,
    List<CommentDto>comments
) { }
