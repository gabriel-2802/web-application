package blog.application.demo.exceptions;

/**
 * Exception thrown when email verification token is invalid or expired
 */
public class InvalidVerificationTokenException extends RuntimeException {
    public InvalidVerificationTokenException(String message) {
        super(message);
    }

    public InvalidVerificationTokenException(String message, Throwable cause) {
        super(message, cause);
    }
}

