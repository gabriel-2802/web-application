package blog.application.demo.utils;

import java.security.SecureRandom;
import java.util.Base64;

/**
 * Utility class for generating secure tokens
 */
public class TokenGenerator {

    private static final SecureRandom secureRandom = new SecureRandom();
    private static final Base64.Encoder base64Encoder = Base64.getUrlEncoder();

    /**
     * Generate a secure random token
     * @return 32-byte secure token encoded in Base64
     */
    public static String generateToken() {
        byte[] randomBytes = new byte[32];
        secureRandom.nextBytes(randomBytes);
        return base64Encoder.withoutPadding().encodeToString(randomBytes);
    }

    /**
     * Generate a verification token for email confirmation
     * @return secure verification token
     */
    public static String generateVerificationToken() {
        return generateToken();
    }

    /**
     * Generate a password reset token
     * @return secure password reset token
     */
    public static String generatePasswordResetToken() {
        return generateToken();
    }
}

