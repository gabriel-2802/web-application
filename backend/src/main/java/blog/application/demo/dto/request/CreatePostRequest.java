package blog.application.demo.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CreatePostRequest(
    @NotNull(message = "Post title is required and cannot be null")
    @NotBlank(message = "Post title cannot be blank or empty")
    String title,
    
    @NotNull(message = "Post content is required and cannot be null")
    @NotBlank(message = "Post content cannot be blank or empty")
    String content,
    
    String imageUrl,
    
    Long collectionId
) {}

