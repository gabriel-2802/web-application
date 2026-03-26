package blog.application.demo.controllers;

import blog.application.demo.dto.request.UpdateBioRequest;
import blog.application.demo.dto.request.UpdateEmailRequest;
import blog.application.demo.dto.request.UpdatePasswordRequest;
import blog.application.demo.dto.request.UpdateProfileImageUrlRequest;
import blog.application.demo.dto.request.UpdateWebsiteUrlRequest;
import blog.application.demo.dto.request.UpdateLocationRequest;
import blog.application.demo.dto.request.UpdateProfessionalTitleRequest;
import blog.application.demo.dto.response.UserProfileResponse;
import blog.application.demo.dto.response.WriterProfileResponse;
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

    @GetMapping("/profile")
    public ResponseEntity<UserProfileResponse> getUserProfile() {
        return userService.getUserProfile();
    }

    @PutMapping("/email")
    public ResponseEntity<UserProfileResponse> updateEmail(@Valid @RequestBody UpdateEmailRequest updateEmailRequest) {
        return userService.updateEmail(updateEmailRequest);
    }

    @PutMapping("/password")
    public ResponseEntity<String> updatePassword(@Valid @RequestBody UpdatePasswordRequest updatePasswordRequest) {
        return userService.updatePassword(updatePasswordRequest);
    }

    @PutMapping("/bio")
    public ResponseEntity<UserProfileResponse> updateBio(@Valid @RequestBody UpdateBioRequest updateBioRequest) {
        return userService.updateBio(updateBioRequest);
    }

    @GetMapping("/writers/{writerId}/profile")
    @PreAuthorize("permitAll()")
    public ResponseEntity<WriterProfileResponse> getWriterProfile(@PathVariable Long writerId) {
        return userService.getWriterProfile(writerId);
    }

    @GetMapping("/writer-profile")
    public ResponseEntity<WriterProfileResponse> getMyWriterProfile() {
        return userService.getMyWriterProfile();
    }


    @PutMapping("/profile-image")
    public ResponseEntity<UserProfileResponse> updateProfileImageUrl(@Valid @RequestBody UpdateProfileImageUrlRequest updateProfileImageUrlRequest) {
        return userService.updateProfileImageUrl(updateProfileImageUrlRequest);
    }

    @PutMapping("/website-url")
    public ResponseEntity<UserProfileResponse> updateWebsiteUrl(@Valid @RequestBody UpdateWebsiteUrlRequest updateWebsiteUrlRequest) {
        return userService.updateWebsiteUrl(updateWebsiteUrlRequest);
    }

    @PutMapping("/location")
    public ResponseEntity<UserProfileResponse> updateLocation(@Valid @RequestBody UpdateLocationRequest updateLocationRequest) {
        return userService.updateLocation(updateLocationRequest);
    }

    @PutMapping("/professional-title")
    public ResponseEntity<UserProfileResponse> updateProfessionalTitle(@Valid @RequestBody UpdateProfessionalTitleRequest updateProfessionalTitleRequest) {
        return userService.updateProfessionalTitle(updateProfessionalTitleRequest);
    }

    @GetMapping("/writer/bio")
    @PreAuthorize("permitAll()")
    public ResponseEntity<String> getWriterBio() {
        return userService.getWriterBio();
    }


    @DeleteMapping("/account")
    public ResponseEntity<String> deleteAccount() {
        return userService.deleteAccount();
    }
}
