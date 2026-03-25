package blog.application.demo.controllers;
import blog.application.demo.dto.request.LoginRequest;
import blog.application.demo.dto.request.RegisterRequest;
import blog.application.demo.dto.response.AuthResponse;
import blog.application.demo.exceptions.ExistingEmailException;
import blog.application.demo.exceptions.ExistingUsernameException;
import blog.application.demo.exceptions.InvalidVerificationTokenException;
import blog.application.demo.services.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.AuthenticationException;
import jakarta.validation.Valid;

/**
 * Rest controller that handles user authentication endpoints.
 */
@RestController
@RequestMapping("api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<String> register(@Valid @RequestBody RegisterRequest registerRequest) {
        authService.register(registerRequest);
        return ResponseEntity.ok("User registered successfully");
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest loginRequest) {
        AuthResponse response = authService.login(loginRequest);
        return ResponseEntity.ok(response);
    }

    /**
     * Verify user's email using the verification token
     * @param token the verification token sent to user's email
     * @return success message
     */
    @GetMapping("/verify-email")
    public ResponseEntity<String> verifyEmail(@RequestParam String token) {
        authService.verifyEmail(token);
        return ResponseEntity.ok("Email verified successfully. Your account is now active.");
    }

    @ExceptionHandler(ExistingUsernameException.class)
    private ResponseEntity<String> handleExistingUsername(ExistingUsernameException e) {
        return ResponseEntity.status(409).body(e.getMessage());
    }

    @ExceptionHandler(ExistingEmailException.class)
    private ResponseEntity<String> handleExistingEmail(ExistingEmailException e) {
        return ResponseEntity.badRequest().body(e.getMessage());
    }

    @ExceptionHandler(InvalidVerificationTokenException.class)
    private ResponseEntity<String> handleInvalidVerificationToken(InvalidVerificationTokenException e) {
        return ResponseEntity.badRequest().body(e.getMessage());
    }

    @ExceptionHandler(AuthenticationException.class)
    private ResponseEntity<String> handleAuthentication(AuthenticationException e) {
        return ResponseEntity.status(401).body("Invalid credentials");
    }
}