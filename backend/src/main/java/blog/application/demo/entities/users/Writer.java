package blog.application.demo.entities.users;

import blog.application.demo.entities.Post;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import java.util.List;

@Entity
@Table(name = "writers")
@PrimaryKeyJoinColumn(name = "user_id")
@Data
@EqualsAndHashCode(callSuper = true)
public class Writer extends AbstractUser {

    @Column(length = 2000)
    private String bio;
    
    @Column(length = 1000)
    private String profileImageUrl;
    
    @Column(length = 1000)
    private String websiteUrl;
    
    @Column(length = 500)
    private String location;
    
    @Column(length = 500)
    private String professionalTitle;

    @OneToMany(mappedBy = "author", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Post> posts;

    @Override
    public String getUserType() {
        return "WRITER";
    }

    @Override
    public boolean canUpdateBio() {
        return true;
    }

    @Override
    public String getBio() {
        return bio;
    }

    @Override
    public void setBio(String bio) {
        this.bio = bio;
    }

    @Override
    public String getProfileImageUrl() {
        return profileImageUrl;
    }

    @Override
    public void setProfileImageUrl(String profileImageUrl) {
        this.profileImageUrl = profileImageUrl;
    }

    @Override
    public String getWebsiteUrl() {
        return websiteUrl;
    }

    @Override
    public void setWebsiteUrl(String websiteUrl) {
        this.websiteUrl = websiteUrl;
    }

    @Override
    public String getLocation() {
        return location;
    }

    @Override
    public void setLocation(String location) {
        this.location = location;
    }

    @Override
    public String getProfessionalTitle() {
        return professionalTitle;
    }

    @Override
    public void setProfessionalTitle(String professionalTitle) {
        this.professionalTitle = professionalTitle;
    }
}