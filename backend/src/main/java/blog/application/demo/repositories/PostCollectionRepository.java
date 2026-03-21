package blog.application.demo.repositories;

import blog.application.demo.entities.PostCollection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PostCollectionRepository extends JpaRepository<PostCollection, Long> {
}
