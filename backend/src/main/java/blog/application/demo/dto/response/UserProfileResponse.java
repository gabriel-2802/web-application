package blog.application.demo.dto.response;

import java.time.LocalDateTime;
import java.util.Set;

public record UserProfileResponse(
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
    Set<String> roles
) {}

