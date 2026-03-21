package blog.application.demo.utils;

import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;

@Component
public class Constants {
    
    @Value("${app.jwt.expiration:2592000000}")
    public long JWT_EXPIRATION;
    
    @Value("${app.jwt.secret}")
    private String jwtSecret;

    public static long ADMIN_REGISTER_CODE = 282828282;
    
    public static final String ADMIN = "ADMIN";
    public static final String USER = "USER";
    public static final String ADMIN_ENDPOINT = "/api/admin/**";
    public static final String USER_ENDPOINT = "/api/user/**";
    
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