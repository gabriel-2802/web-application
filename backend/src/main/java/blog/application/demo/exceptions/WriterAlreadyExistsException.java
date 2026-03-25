package blog.application.demo.exceptions;

/**
 * Exception thrown when attempting to create a writer account when one already exists.
 * The system enforces a single writer constraint.
 */
public class WriterAlreadyExistsException extends RuntimeException {
    public WriterAlreadyExistsException(String message) {
        super(message);
    }

    public WriterAlreadyExistsException(String message, Throwable cause) {
        super(message, cause);
    }
}

