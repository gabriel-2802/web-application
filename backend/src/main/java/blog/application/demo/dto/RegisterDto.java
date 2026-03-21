package blog.application.demo.dto;

public record RegisterDto(
        String username,
        String email,
        String password,
        Long adminRegisterCode
) {}