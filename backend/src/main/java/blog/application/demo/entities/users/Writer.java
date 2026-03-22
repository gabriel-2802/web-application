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
}