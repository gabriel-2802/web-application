package blog.application.demo.exceptions;

public class ExistingUsernameException extends Exception {
    public ExistingUsernameException(String message) {
        super(message);
    }
}
