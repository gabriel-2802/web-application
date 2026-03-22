package blog.application.demo.controllers;

import blog.application.demo.dto.request.UpdateBioRequest;
import blog.application.demo.dto.request.UpdateEmailRequest;
import blog.application.demo.dto.request.UpdatePasswordRequest;
import blog.application.demo.dto.request.UpdateUsernameRequest;
import blog.application.demo.dto.response.UserProfileResponse;
import blog.application.demo.exceptions.ExistingEmailException;
import blog.application.demo.exceptions.ExistingUsernameException;
import blog.application.demo.exceptions.UnauthorizedException;
import blog.application.demo.services.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/**
 * REST Controller for user profile management
 * Handles user profile retrieval, updates, and account deletion
 * Requires authentication for all endpoints
 */
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@PreAuthorize("isAuthenticated()")
public class UserController {
    
    private final UserService userService;

    /**
     * Get current authenticated user's profile information
     * @return UserProfileResponse with complete user details
     */
    @GetMapping("/profile")
    public ResponseEntity<UserProfileResponse> getUserProfile() {
        return userService.getUserProfile();
    }

    /**
     * Update current user's username
     * Username must not conflict with existing usernames
     * @param updateUsernameRequest containing new username
     * @return UserProfileResponse with updated profile
     * @throws ExistingUsernameException if username already taken
     */
    @PutMapping("/username")
    public ResponseEntity<UserProfileResponse> updateUsername(@Valid @RequestBody UpdateUsernameRequest updateUsernameRequest) {
        return userService.updateUsername(updateUsernameRequest);
    }

    /**
     * Update current user's email address
     * Email must not conflict with existing emails
     * @param updateEmailRequest containing new email
     * @return UserProfileResponse with updated profile
     * @throws ExistingEmailException if email already registered
     */
    @PutMapping("/email")
    public ResponseEntity<UserProfileResponse> updateEmail(@Valid @RequestBody UpdateEmailRequest updateEmailRequest) {
        return userService.updateEmail(updateEmailRequest);
    }

    /**
     * Update current user's password
     * Requires verification of current password and confirmation of new password
     * @param updatePasswordRequest containing current password, new password, and confirmation
     * @return Success message
     * @throws UnauthorizedException if current password incorrect or validation fails
     */
    @PutMapping("/password")
    public ResponseEntity<String> updatePassword(@Valid @RequestBody UpdatePasswordRequest updatePasswordRequest) {
        return userService.updatePassword(updatePasswordRequest);
    }

    /**
     * Update user's bio (Writers only)
     * Allows writers to update their professional biography
     * @param updateBioRequest containing new bio text (max 2000 characters)
     * @return UserProfileResponse with updated profile
     * @throws UnauthorizedException if user is not a writer
     */
    @PutMapping("/bio")
    public ResponseEntity<UserProfileResponse> updateBio(@Valid @RequestBody UpdateBioRequest updateBioRequest) {
        return userService.updateBio(updateBioRequest);
    }

    /**
     * Delete current user's account permanently
     * @return Success message confirming account deletion
     */
    @DeleteMapping("/account")
    public ResponseEntity<String> deleteAccount() {
        return userService.deleteAccount();
    }

    /**
     * Exception handler for existing username conflicts
     */
    @ExceptionHandler(ExistingUsernameException.class)
    public ResponseEntity<String> handleExistingUsername(ExistingUsernameException e) {
        return ResponseEntity.status(409).body(e.getMessage());
    }

    /**
     * Exception handler for existing email conflicts
     */
    @ExceptionHandler(ExistingEmailException.class)
    public ResponseEntity<String> handleExistingEmail(ExistingEmailException e) {
        return ResponseEntity.status(409).body(e.getMessage());
    }

    /**
     * Exception handler for authorization failures
     */
    @ExceptionHandler(UnauthorizedException.class)
    public ResponseEntity<String> handleUnauthorized(UnauthorizedException e) {
        return ResponseEntity.status(401).body(e.getMessage());
    }
}
