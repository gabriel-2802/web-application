package blog.application.demo.entities;

import blog.application.demo.entities.users.Writer;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "collections")
@Data
public class PostCollection {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "collection_id")
    private Long id;

    @Column(columnDefinition = "boolean default false")
    private boolean pinned = false;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, updatable = false)
    LocalDateTime createdAt;

    private String description;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "owner_id", nullable = false)
    private Writer owner;

    @OneToMany(mappedBy = "collection", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Post> posts;

    @PrePersist
    protected void onCreate() { createdAt = LocalDateTime.now(); }
}
