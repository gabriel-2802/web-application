package blog.application.demo.dto.response;

import java.time.LocalDateTime;
import java.util.List;

public record PostResponse(
    Long id,
    String title,
    String content,
    String imageUrl,
    LocalDateTime createdAt,
    LocalDateTime updatedAt,
    Long authorId,
    String authorUsername,
    Long collectionId,
    List<CommentResponse> comments
) {}

