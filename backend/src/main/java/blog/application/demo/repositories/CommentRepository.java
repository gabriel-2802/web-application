package blog.application.demo.repositories;

import blog.application.demo.entities.Comment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {
    
    @Query("SELECT c FROM Comment c WHERE c.post.id = :postId")
    List<Comment> findByPostId(@Param("postId") Long postId);
    
    @Query("SELECT c FROM Comment c WHERE c.post.id = :postId AND c.parent IS NULL")
    List<Comment> findTopLevelCommentsByPostId(@Param("postId") Long postId);
    
    @Query("SELECT c FROM Comment c WHERE c.parent.id = :parentCommentId")
    List<Comment> findRepliesByParentCommentId(@Param("parentCommentId") Long parentCommentId);
}
