package blog.application.demo.controllers;
import blog.application.demo.dto.AuthDto;
import blog.application.demo.dto.LoginDto;
import blog.application.demo.dto.RegisterDto;
import blog.application.demo.exceptions.ExistingEmailException;
import blog.application.demo.exceptions.ExistingUsernameException;
import blog.application.demo.services.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
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
        try {
            authService.register(registerDTO);
            return ResponseEntity.ok("User registered successfully");
        } catch (ExistingUsernameException e) {
            return ResponseEntity.status(409).body(e.getMessage());
        } catch (ExistingEmailException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
        catch (Exception e) {
            return ResponseEntity.status(500).body("An error occurred during registration : " +  e.getMessage());
        }
    }

    @PostMapping("/login")
    public ResponseEntity<AuthDto> login(@RequestBody LoginDto loginDTO) {
        try {
            AuthDto response = authService.login(loginDTO);
            return ResponseEntity.ok(response);
        } catch (AuthenticationException e) {
            return ResponseEntity.badRequest().body(new AuthDto("Invalid credentials"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(new AuthDto("An error occurred: " + e.getMessage()));
        }
    }

}
