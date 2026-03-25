package blog.application.demo.entities.users;

import blog.application.demo.entities.Comment;
import blog.application.demo.entities.Role;
import jakarta.persistence.*;
import lombok.Data;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import java.util.Set;

@Entity
@Table(name = "users")
@Inheritance(strategy = InheritanceType.JOINED)
@Data
public abstract class AbstractUser implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id")
    private Long id;

    @Column(unique = true, nullable = false)
    private String username;

    @Column(nullable = false)
    private String password;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(name = "email_verified", nullable = false)
    private Boolean emailVerified = false;

    @Column(name = "verification_token")
    private String verificationToken;

    @Column(name = "verification_token_expiry")
    private LocalDateTime verificationTokenExpiry;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
            name = "user_roles",
            joinColumns = @JoinColumn(name = "user_id"),
            inverseJoinColumns = @JoinColumn(name = "role_id")
    )
    private Set<Role> authorities;

    @OneToMany(mappedBy = "author", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Comment> comments;

    @Override
    public Collection<Role> getAuthorities() { return authorities; }

    @Override
    public boolean isAccountNonExpired()  { return true; }
    @Override
    public boolean isAccountNonLocked()   { return true; }
    @Override
    public boolean isCredentialsNonExpired() { return true; }
    @Override
    public boolean isEnabled() { return true; }

    public void setRoles(Set<Role> role) {
        authorities = role;
    }

    /**
     * Get user type identifier
     * @return "WRITER" for writers, "VIEWER" for viewers
     */
    public abstract String getUserType();

    /**
     * Get user's bio
     * @return bio text or null if not applicable
     */
    public abstract String getBio();

    /**
     * Set user's bio
     * @param bio the bio text
     */
    public abstract void setBio(String bio);

    /**
     * Check if user can update bio (writers only)
     * @return true if user can update bio, false otherwise
     */
    public abstract boolean canUpdateBio();

    /**
     * Get profile image URL
     * @return profile image URL or null
     */
    public abstract String getProfileImageUrl();

    /**
     * Get website URL (writers only)
     * @return website URL or null
     */
    public abstract String getWebsiteUrl();

    /**
     * Get location (writers only)
     * @return location or null
     */
    public abstract String getLocation();

    /**
     * Get professional title (writers only)
     * @return professional title or null
     */
    public abstract String getProfessionalTitle();
}