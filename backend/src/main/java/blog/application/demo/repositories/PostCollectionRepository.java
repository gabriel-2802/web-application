package blog.application.demo.repositories;

import blog.application.demo.entities.PostCollection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;


@Repository
public interface PostCollectionRepository extends JpaRepository<PostCollection, Long> {
    @Modifying
    @Query("UPDATE Post p SET p.collection = null WHERE p.collection.id = :collectionId")
    void nullifyPostCollections(@Param("collectionId") Long collectionId);

}
