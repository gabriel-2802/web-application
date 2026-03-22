package blog.application.demo.controllers;

import blog.application.demo.exceptions.ExistingEmailException;
import blog.application.demo.exceptions.ExistingUsernameException;
import blog.application.demo.exceptions.ResourceNotFoundException;
import blog.application.demo.exceptions.UnauthorizedException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    /**
     * Handle authentication exceptions (401 Unauthorized)
     */
    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<Map<String, Object>> handleAuthenticationException(AuthenticationException e) {
        return buildErrorResponse(HttpStatus.UNAUTHORIZED, e.getMessage());
    }
    /**
     * Handle user not found exceptions (401 Unauthorized)
     * This occurs when a token references a user that no longer exists
     */
    @ExceptionHandler(UsernameNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleUsernameNotFoundException(UsernameNotFoundException e) {
        return buildErrorResponse(HttpStatus.UNAUTHORIZED, "User not found or has been deleted");
    }

    /**
     * Handle authorization exceptions (403 Forbidden)
     */
    @ExceptionHandler(UnauthorizedException.class)
    public ResponseEntity<Map<String, Object>> handleUnauthorizedException(UnauthorizedException e) {
        return buildErrorResponse(HttpStatus.FORBIDDEN, e.getMessage());
    }

    /**
     * Handle resource not found exceptions (404 Not Found)
     */
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleResourceNotFoundException(ResourceNotFoundException e) {
        return buildErrorResponse(HttpStatus.NOT_FOUND, e.getMessage());
    }

    /**
     * Handle duplicate email exceptions (409 Conflict)
     */
    @ExceptionHandler(ExistingEmailException.class)
    public ResponseEntity<Map<String, Object>> handleExistingEmailException(ExistingEmailException e) {
        return buildErrorResponse(HttpStatus.CONFLICT, e.getMessage());
    }

    /**
     * Handle duplicate username exceptions (409 Conflict)
     */
    @ExceptionHandler(ExistingUsernameException.class)
    public ResponseEntity<Map<String, Object>> handleExistingUsernameException(ExistingUsernameException e) {
        return buildErrorResponse(HttpStatus.CONFLICT, e.getMessage());
    }

    /**
     * Handle validation errors (400 Bad Request)
     */
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, Object>> handleIllegalArgumentException(IllegalArgumentException e) {
        return buildErrorResponse(HttpStatus.BAD_REQUEST, e.getMessage());
    }

    /**
     * Handle generic exceptions (500 Internal Server Error)
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGenericException(Exception e) {
        return buildErrorResponse(HttpStatus.INTERNAL_SERVER_ERROR, "An unexpected error occurred: " + e.getMessage());
    }

    /**
     * Build a standardized error response
     */
    private ResponseEntity<Map<String, Object>> buildErrorResponse(HttpStatus status, String message) {
        Map<String, Object> errorDetails = new HashMap<>();
        errorDetails.put("timestamp", LocalDateTime.now());
        errorDetails.put("status", status.value());
        errorDetails.put("error", status.getReasonPhrase());
        errorDetails.put("message", message);

        return ResponseEntity.status(status).body(errorDetails);
    }

    /**
     * Handle validation errors from annotations (400 Bad Request)
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidation(MethodArgumentNotValidException e) {
        Map<String, Object> validationErrors = new HashMap<>();
        Map<String, String> fieldErrors = new HashMap<>();

        e.getBindingResult()
                .getFieldErrors()
                .forEach(error -> fieldErrors.put(error.getField(), error.getDefaultMessage()));

        validationErrors.put("timestamp", LocalDateTime.now());
        validationErrors.put("status", HttpStatus.BAD_REQUEST.value());
        validationErrors.put("error", "Validation Failed");
        validationErrors.put("fieldErrors", fieldErrors);

        return ResponseEntity.badRequest().body(validationErrors);
    }


    @ExceptionHandler(NullPointerException.class)
    public ResponseEntity<String> handleNullPointer(NullPointerException e) {
        return ResponseEntity.badRequest().body(e.getMessage());
    }
}
