package blog.application.demo.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CreateCommentRequest(
    @NotNull(message = "Comment content is required and cannot be null")
    @NotBlank(message = "Comment content cannot be blank or empty")
    String content,
    
    @NotNull(message = "Post ID is required and cannot be null")
    Long postId,
    
    Long parentCommentId
) {}

