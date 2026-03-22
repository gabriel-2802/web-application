package blog.application.demo.services;

import blog.application.demo.dto.request.UpdateBioRequest;
import blog.application.demo.dto.request.UpdateEmailRequest;
import blog.application.demo.dto.request.UpdatePasswordRequest;
import blog.application.demo.dto.request.UpdateUsernameRequest;
import blog.application.demo.dto.response.UserProfileResponse;
import blog.application.demo.dto.response.WriterProfileResponse;
import blog.application.demo.dto.response.PostResponse;
import blog.application.demo.dto.response.CollectionResponse;
import blog.application.demo.entities.Comment;
import blog.application.demo.entities.users.AbstractUser;
import blog.application.demo.entities.Post;
import blog.application.demo.entities.PostCollection;
import blog.application.demo.exceptions.ExistingEmailException;
import blog.application.demo.exceptions.ExistingUsernameException;
import blog.application.demo.exceptions.ResourceNotFoundException;
import blog.application.demo.exceptions.UnauthorizedException;
import blog.application.demo.mappers.PostMapper;
import blog.application.demo.mappers.CollectionMapper;
import blog.application.demo.repositories.CommentRepository;
import blog.application.demo.repositories.PostRepository;
import blog.application.demo.repositories.PostCollectionRepository;
import blog.application.demo.repositories.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class UserService extends AbstractService {
    
    private final CommentRepository commentRepository;
    private final PostRepository postRepository;
    private final PostCollectionRepository collectionRepository;
    private final PostMapper postMapper;
    private final CollectionMapper collectionMapper;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, CommentRepository commentRepository, PostRepository postRepository,
                       PostCollectionRepository collectionRepository, PostMapper postMapper, CollectionMapper collectionMapper,
                       PasswordEncoder passwordEncoder) {
        super(userRepository);
        this.commentRepository = commentRepository;
        this.postRepository = postRepository;
        this.collectionRepository = collectionRepository;
        this.postMapper = postMapper;
        this.collectionMapper = collectionMapper;
        this.passwordEncoder = passwordEncoder;
    }

    /**
     * Get current user's profile information
     * @return UserProfileResponse with detailed user information
     */
    @Transactional(readOnly = true)
    public ResponseEntity<UserProfileResponse> getUserProfile() {
        AbstractUser currentUser = getCurrentUser();
        return ResponseEntity.ok(mapToUserProfile(currentUser));
    }

    /**
     * Update user's username (must not conflict with existing usernames)
     * @param updateUsernameRequest new username
     * @return UserProfileResponse with updated user information
     * @throws ExistingUsernameException if username already exists
     */
    public ResponseEntity<UserProfileResponse> updateUsername(UpdateUsernameRequest updateUsernameRequest){
        AbstractUser currentUser = getCurrentUser();
        
        // check if new username already exists
        if (userRepository.findByUsername(updateUsernameRequest.newUsername()).isPresent()) {
            throw new ExistingUsernameException("Username '" + updateUsernameRequest.newUsername() + "' is already taken");
        }
        
        currentUser.setUsername(updateUsernameRequest.newUsername());
        AbstractUser updatedUser = userRepository.save(currentUser);
        
        return ResponseEntity.ok(mapToUserProfile(updatedUser));
    }

    /**
     * Update user's email (must not conflict with existing emails)
     * @param updateEmailRequest new email
     * @return UserProfileResponse with updated user information
     * @throws ExistingEmailException if email already exists
     */
    public ResponseEntity<UserProfileResponse> updateEmail(UpdateEmailRequest updateEmailRequest) 
            throws ExistingEmailException {
        AbstractUser currentUser = getCurrentUser();
        
        // check if new email already exists
        if (userRepository.findByEmail(updateEmailRequest.newEmail()).isPresent()) {
            throw new ExistingEmailException("Email '" + updateEmailRequest.newEmail() + "' is already registered");
        }
        
        currentUser.setEmail(updateEmailRequest.newEmail());
        AbstractUser updatedUser = userRepository.save(currentUser);
        
        return ResponseEntity.ok(mapToUserProfile(updatedUser));
    }

    /**
     * Update user's password (requires current password verification)
     * @param updatePasswordRequest containing current password and new password with confirmation
     * @return ResponseEntity with success message
     * @throws UnauthorizedException if current password is incorrect or passwords don't match
     */
    public ResponseEntity<String> updatePassword(UpdatePasswordRequest updatePasswordRequest) 
            throws UnauthorizedException {
        AbstractUser currentUser = getCurrentUser();
        
        // verify current password
        if (!passwordEncoder.matches(updatePasswordRequest.currentPassword(), currentUser.getPassword())) {
            throw new UnauthorizedException("Current password is incorrect");
        }
        
        // verify new passwords match
        if (!updatePasswordRequest.newPassword().equals(updatePasswordRequest.confirmPassword())) {
            throw new UnauthorizedException("New password and confirmation password do not match");
        }
        
        // verify new password is different from old password
        if (updatePasswordRequest.currentPassword().equals(updatePasswordRequest.newPassword())) {
            throw new UnauthorizedException("New password must be different from current password");
        }
        
        // encode and save new password
        String encodedPassword = passwordEncoder.encode(updatePasswordRequest.newPassword());
        currentUser.setPassword(encodedPassword);
        userRepository.save(currentUser);
        
        return ResponseEntity.ok("Password updated successfully");
    }

    /**
     * Update user's bio (only for writers)
     * @param updateBioRequest new bio text
     * @return UserProfileResponse with updated user information
     * @throws UnauthorizedException if user is not a writer
     */
    public ResponseEntity<UserProfileResponse> updateBio(UpdateBioRequest updateBioRequest) 
            throws UnauthorizedException {
        AbstractUser currentUser = getCurrentUser();
        
        // check if user can update bio (uses polymorphism)
        if (!currentUser.canUpdateBio()) {
            throw new UnauthorizedException("Only writers can update their bio");
        }
        
        currentUser.setBio(updateBioRequest.bio());
        AbstractUser updatedUser = userRepository.save(currentUser);
        
        return ResponseEntity.ok(mapToUserProfile(updatedUser));
    }

    /**
     * Get a writer's complete public profile with posts and collections
     * @param writerId the ID of the writer
     * @return WriterProfileResponse with profile, posts, and collections
     * @throws ResourceNotFoundException if writer not found
     */
    @Transactional(readOnly = true)
    public ResponseEntity<WriterProfileResponse> getWriterProfile(Long writerId) {
        AbstractUser user = userRepository.findById(writerId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + writerId));
        
        if (!user.getUserType().equals("WRITER")) {
            throw new ResourceNotFoundException("User with id: " + writerId + " is not a writer");
        }
        
        // Get all posts by this writer
        List<PostResponse> posts = postRepository.findAll().stream()
                .filter(post -> post.getAuthor().getId().equals(writerId))
                .map(postMapper::toResponse)
                .collect(Collectors.toList());
        
        // Get all collections owned by this writer
        List<CollectionResponse> collections = collectionRepository.findAll().stream()
                .filter(collection -> collection.getOwner().getId().equals(writerId))
                .map(collectionMapper::toResponse)
                .collect(Collectors.toList());
        
        WriterProfileResponse profile = new WriterProfileResponse(
            user.getId(),
            user.getUsername(),
            user.getEmail(),
            user.getUserType(),
            user.getBio(),
            user.getProfileImageUrl(),
            user.getWebsiteUrl(),
            user.getLocation(),
            user.getProfessionalTitle(),
            null,
            null,
            user.getAuthorities().stream()
                .map(role -> role.getAuthority())
                .collect(Collectors.toSet()),
            posts,
            collections
        );
        
        return ResponseEntity.ok(profile);
    }

    /**
     * Get current authenticated writer's profile with their posts and collections
     * @return WriterProfileResponse with profile, posts, and collections
     * @throws UnauthorizedException if current user is not a writer
     */
    @Transactional(readOnly = true)
    public ResponseEntity<WriterProfileResponse> getMyWriterProfile() {
        AbstractUser currentUser = getCurrentUser();
        
        if (!currentUser.getUserType().equals("WRITER")) {
            throw new UnauthorizedException("Only writers can access this endpoint");
        }
        
        return getWriterProfile(currentUser.getId());
    }

    /**
     * Delete user's account permanently
     * 
     * For Writers:
     * - All posts authored by this writer are automatically deleted (cascade.ALL on Writer.posts)
     * - All posts cascade their deletion to their comments (cascade.ALL on Post.comments)
     * - All collections owned by this writer are automatically deleted (cascade.ALL on PostCollection.posts)
     * 
     * For All Users:
     * - All comments authored by this user are intelligently deleted:
     *   * Child comments are promoted to parent level (preserving threads)
     *   * Then the user's comments are deleted
     * 
     * WARNING: This operation is irreversible!
     * 
     * @return ResponseEntity with success message
     */
    public ResponseEntity<String> deleteAccount() {
        AbstractUser currentUser = getCurrentUser();
        Long userId = currentUser.getId();
        
        // Find all comments authored by this user and intelligently promote their replies
        List<Comment> userComments = commentRepository.findByAuthorId(userId);
        
        for (Comment comment : userComments) {
            // Get the parent of the comment being deleted (could be null if top-level)
            Comment parentOfDeleted = comment.getParent();
            
            // Find all direct replies to this comment
            List<Comment> childComments = commentRepository.findRepliesByParentCommentId(comment.getId());
            
            // Promote all child comments to parent's level
            for (Comment child : childComments) {
                child.setParent(parentOfDeleted);
                child.setUpdatedAt(LocalDateTime.now());
                commentRepository.save(child);
            }
        }
        
        // Cascade.ALL on writer posts will delete posts and their comments
        // Cascade.ALL on collections will delete collections and their posts
        // Cascade.ALL on user comments will delete remaining promoted comments (those without children)
        userRepository.deleteById(userId);
        
        return ResponseEntity.ok("Account deleted successfully. All associated data has been removed.");
    }

    /**
     * Map AbstractUser entity to UserProfileResponse DTO
     * Uses polymorphism to handle different user types
     * @param user the user entity
     * @return UserProfileResponse
     */
    private UserProfileResponse mapToUserProfile(AbstractUser user) {
        return new UserProfileResponse(
            user.getId(),
            user.getUsername(),
            user.getEmail(),
            user.getUserType(),
            user.getBio(),
            user.getProfileImageUrl(),
            user.getWebsiteUrl(),
            user.getLocation(),
            user.getProfessionalTitle(),
            null,
            null,
            user.getAuthorities().stream()
                .map(role -> role.getAuthority())
                .collect(Collectors.toSet())
        );
    }
}

