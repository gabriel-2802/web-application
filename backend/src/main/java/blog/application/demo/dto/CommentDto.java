package blog.application.demo.dto;

import lombok.NonNull;
import org.springframework.cglib.core.Local;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import java.time.LocalDateTime;
import java.util.List;

public record CommentDto(
    Long id,
    @NotNull @NotBlank
    String content,
    LocalDateTime createdAt,
    LocalDateTime updatedAt,
    Long authorId,
    String authorUsername,
    @NotNull
    Long postId,
    Long parentCommentId,
    @NotNull
    Boolean isChildComment,
    Boolean hasReplies,
    List<CommentDto> replies
) { }

