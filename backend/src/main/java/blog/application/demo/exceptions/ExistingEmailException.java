package blog.application.demo.exceptions;

public class ExistingEmailException extends Exception {
    public ExistingEmailException(String message) {
        super(message);
    }
}
