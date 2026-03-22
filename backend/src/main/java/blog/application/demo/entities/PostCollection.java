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
}
