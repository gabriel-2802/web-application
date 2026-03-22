package blog.application.demo.utils;

import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;

/**
 * Utility class for application-wide constants and configuration values, including JWT settings and role definitions
 */
@Component
public class Constants {
    
    @Value("${app.jwt.expiration:2592000000}")
    public long JWT_EXPIRATION;
    
    @Value("${app.jwt.secret}")
    private String jwtSecret;

    @Value("${app.admin.register.code:282828282}")
    public long ADMIN_REGISTER_CODE;
    
    public static final String ADMIN = "ADMIN";
    public static final String USER = "USER";
    
    private SecretKey secretKey;
    
    /**
     * Lazily initializes and returns the SecretKey for JWT signing
     */
    public SecretKey getKey() {
        if (secretKey == null && jwtSecret != null) {
            secretKey = Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
        }
        return secretKey;
    }
}