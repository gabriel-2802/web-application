package blog.application.demo.dto.response;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

/**
 * Response DTO for a writer's complete public profile
 * Includes profile information, posts, and collections
 */
public record WriterProfileResponse(
    Long id,
    String username,
    String email,
    String userType,
    String bio,
    String profileImageUrl,
    String websiteUrl,
    String location,
    String professionalTitle,
    LocalDateTime createdAt,
    LocalDateTime updatedAt,
    Set<String> roles,
    List<PostResponse> posts,
    List<CollectionResponse> collections
) {}

