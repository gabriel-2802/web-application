package blog.application.demo.dto;

import org.springframework.cglib.core.Local;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;
import java.util.List;

public record CommentDto(
    Long id,
    @NotNull(message = "Comment content is required and cannot be null")
    @NotBlank(message = "Comment content cannot be blank or empty")
    String content,
    LocalDateTime createdAt,
    LocalDateTime updatedAt,
    Long authorId,
    String authorUsername,
    @NotNull(message = "Post ID is required and cannot be null")
    Long postId,
    Long parentCommentId,
    @NotNull(message = "Child comment flag is required and cannot be null")
    Boolean isChildComment,
    Boolean hasReplies,
    List<CommentDto> replies
) { }

