package blog.application.demo.dto.response;

import java.time.LocalDateTime;
import java.util.List;

public record CollectionResponse(
    Long id,
    String name,
    String description,
    String owner,
    String ownerId,
    Boolean pinned,
    LocalDateTime createdAt,
    List<PostResponse> posts
) {}

