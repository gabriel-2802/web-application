package blog.application.demo.dto.response;

public record AuthResponse(
    String accessToken,
    String tokenType
) {
    public AuthResponse(String accessToken) {
        this(accessToken, "Bearer");
    }
}

