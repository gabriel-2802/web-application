package blog.application.demo.dto;

public record AuthDto(
        String accessToken,
        String tokenType
) {
    public AuthDto(String accessToken) {
        this(accessToken, "Bearer ");
    }
}

