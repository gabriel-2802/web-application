package blog.application.demo.dto.response;

import java.time.LocalDateTime;
import java.util.List;

public record CommentResponse(
    Long id,
    String content,
    LocalDateTime createdAt,
    LocalDateTime updatedAt,
    Long authorId,
    String authorUsername,
    Long postId,
    Long parentCommentId,
    Boolean isChildComment,
    Boolean hasReplies,
    List<CommentResponse> replies
) {}

