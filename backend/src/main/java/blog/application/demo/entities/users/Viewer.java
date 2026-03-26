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
    public void setWebsiteUrl(String websiteUrl) {
        // Viewers cannot have website URL
    }

    @Override
    public String getLocation() {
        return null;
    }

    @Override
    public void setLocation(String location) {
        // Viewers cannot have location
    }

    @Override
    public String getProfessionalTitle() {
        return null;
    }

    @Override
    public void setProfessionalTitle(String professionalTitle) {
        // Viewers cannot have professional title
    }
}
