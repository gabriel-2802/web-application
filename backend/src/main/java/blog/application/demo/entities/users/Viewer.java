package blog.application.demo.entities.users;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Entity
@Table(name = "viewers")
@PrimaryKeyJoinColumn(name = "user_id")
@Data
@EqualsAndHashCode(callSuper = true)
public class Viewer extends AbstractUser {
    @Column(length = 1000)
    private String profileImageUrl;

    @Override
    public String getUserType() {
        return "VIEWER";
    }

    @Override
    public String getBio() {
        return null;
    }

    @Override
    public void setBio(String bio) {
        // Viewers cannot have bio
    }

    @Override
    public boolean canUpdateBio() {
        return false;
    }

    @Override
    public String getWebsiteUrl() {
        return null;
    }

    @Override
    public String getLocation() {
        return null;
    }

    @Override
    public String getProfessionalTitle() {
        return null;
    }
}
