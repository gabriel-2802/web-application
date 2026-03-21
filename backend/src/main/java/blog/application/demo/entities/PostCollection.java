package blog.application.demo.entities;

import blog.application.demo.entities.users.Writer;
import jakarta.persistence.*;
import lombok.Data;
import java.util.List;

@Entity
@Table(name = "collections")
@Data
public class PostCollection {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "collection_id")
    private Long id;

    @Column(nullable = false)
    private String name;

    private String description;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "owner_id", nullable = false)
    private Writer owner;

    // posts must survive collection deletion
    @OneToMany(mappedBy = "collection")
    private List<Post> posts;

    @PreRemove
    private void preRemove() {
        // Set all posts' collections to null before deletion
        // Note: For better performance in production, consider using a bulk update query
        // via a custom repository method instead of loading all posts into memory
        if (posts != null && !posts.isEmpty()) {
            posts.forEach(p -> p.setCollection(null));
        }
    }
}
