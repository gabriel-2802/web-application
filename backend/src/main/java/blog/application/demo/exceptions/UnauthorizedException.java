package blog.application.demo.exceptions;

/**
 * Runtime exception thrown when a user attempts an action they are not authorized to perform.
 * Typically results in a 403 Forbidden HTTP response.
 */
public class UnauthorizedException extends RuntimeException {
    
    public UnauthorizedException(String message) {
        super(message);
    }

    public UnauthorizedException(String message, Throwable cause) {
        super(message, cause);
    }
}

