package blog.application.demo.dto.response;

import java.util.Set;

public record UserResponse(
    Long id,
    String username,
    String email,
    Set<String> roles
) {}

