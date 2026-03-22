package blog.application.demo.exceptions;

public class ExistingUsernameException extends RuntimeException {
    public ExistingUsernameException(String message) {
        super(message);
    }
}
