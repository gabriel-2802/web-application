package blog.application.demo.repositories;

import blog.application.demo.entities.Post;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PostRepository extends JpaRepository<Post, Long> {

    @Query(value = "SELECT * FROM posts WHERE " +
            "to_tsvector('english', title || ' ' || content) " +
            "@@ plainto_tsquery('english', :keyword)",
            nativeQuery = true)
    List<Post> searchByKeyword(@Param("keyword") String keyword);
}
