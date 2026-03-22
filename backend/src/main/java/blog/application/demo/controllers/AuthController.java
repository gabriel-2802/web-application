package blog.application.demo.controllers;
import blog.application.demo.dto.AuthDto;
import blog.application.demo.dto.LoginDto;
import blog.application.demo.dto.RegisterDto;
import blog.application.demo.exceptions.ExistingEmailException;
import blog.application.demo.exceptions.ExistingUsernameException;
import blog.application.demo.services.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.AuthenticationException;

/**
 * Rest controller that handles user authentication endpoints.
 */
@RestController
@RequestMapping("api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<String> register(@RequestBody RegisterDto registerDTO) {
        authService.register(registerDTO);
        return ResponseEntity.ok("User registered successfully");
    }

    @PostMapping("/login")
    public ResponseEntity<AuthDto> login(@RequestBody LoginDto loginDTO) {
        AuthDto response = authService.login(loginDTO);
        return ResponseEntity.ok(response);
    }

    @ExceptionHandler(ExistingUsernameException.class)
    private ResponseEntity<String> handleExistingUsername(ExistingUsernameException e) {
        return ResponseEntity.status(409).body(e.getMessage());
    }

    @ExceptionHandler(ExistingEmailException.class)
    private ResponseEntity<String> handleExistingEmail(ExistingEmailException e) {
        return ResponseEntity.badRequest().body(e.getMessage());
    }

    @ExceptionHandler(AuthenticationException.class)
    private ResponseEntity<String> handleAuthentication(AuthenticationException e) {
        return ResponseEntity.status(401).body("Invalid credentials");
    }
}