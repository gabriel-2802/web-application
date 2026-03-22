package blog.application.demo.services;

import blog.application.demo.dto.CommentDto;
import blog.application.demo.entities.Comment;
import blog.application.demo.entities.Post;
import blog.application.demo.entities.users.AbstractUser;
import blog.application.demo.exceptions.ResourceNotFoundException;
import blog.application.demo.exceptions.UnauthorizedException;
import blog.application.demo.mappers.CommentMapper;
import blog.application.demo.repositories.CommentRepository;
import blog.application.demo.repositories.PostRepository;
import blog.application.demo.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional
public class CommentService {
    private final CommentRepository commentRepository;
    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final CommentMapper commentMapper;

    /**
     * Creates a new comment on a post
     * @param commentDto the comment data
     * @return ResponseEntity with the created CommentDto
     * @throws ResourceNotFoundException if post not found
     * @throws IllegalArgumentException if content is empty
     */
    public ResponseEntity<CommentDto> createComment(CommentDto commentDto) {
        Post post = postRepository.findById(commentDto.postId())
                .orElseThrow(() -> new ResourceNotFoundException("Post not found with id: " + commentDto.postId()));

        Comment parentComment = null;
        if (commentDto.isChildComment()) {
            Optional<Comment> parentOpt = commentRepository.findById(commentDto.parentCommentId());
            if (parentOpt.isEmpty()) {
                throw new ResourceNotFoundException("Parent comment not found with id: " + commentDto.parentCommentId());
            }

            parentComment = parentOpt.get();

            if (parentComment.getPost().getId() != post.getId()) {
                throw new IllegalArgumentException("Parent comment does not belong to the same post");
            }
        }

        AbstractUser author = getCurrentUser();

        Comment comment = commentMapper.toEntity(commentDto);
        comment.setAuthor(author);
        comment.setPost(post);
        comment.setParent(parentComment);

        Comment savedComment = commentRepository.save(comment);
        CommentDto responseDto = commentMapper.toDTO(savedComment);

        post.getComments().add(savedComment);
        postRepository.save(post);

        return ResponseEntity.status(HttpStatus.CREATED).body(responseDto);
    }

    /**
     * Retrieves all comments for a post
     * @param postId the post ID
     * @return ResponseEntity with list of CommentDtos
     * @throws ResourceNotFoundException if post not found
     */
    @Transactional(readOnly = true)
    public ResponseEntity<List<CommentDto>> getCommentsByPost(Long postId) {
        // verify post exists
        postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found with id: " + postId));

        List<Comment> comments = commentRepository.findByPostId(postId);
        List<CommentDto> commentDtos = comments.stream()
                .map(commentMapper::toDTO)
                .sorted((c1, c2) -> c1.createdAt().compareTo(c2.createdAt()))
                .toList();

        return ResponseEntity.ok(commentDtos);
    }

    /**
     * Retrieves top-level comments for a post (excluding replies)
     * @param postId the post ID
     * @return ResponseEntity with list of top-level CommentDtos
     * @throws ResourceNotFoundException if post not found
     */
    @Transactional(readOnly = true)
    public ResponseEntity<List<CommentDto>> getTopLevelComments(Long postId) {
        // Verify post exists
        postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found with id: " + postId));

        List<Comment> comments = commentRepository.findTopLevelCommentsByPostId(postId);
        List<CommentDto> commentDtos = comments.stream()
                .map(commentMapper::toDTO)
                .sorted((c1, c2) -> c1.createdAt().compareTo(c2.createdAt()))
                .toList();

        return ResponseEntity.ok(commentDtos);
    }

    /**
     * Retrieves all replies to a comment
     * @param commentId the parent comment ID
     * @return ResponseEntity with list of reply CommentDtos
     * @throws ResourceNotFoundException if comment not found
     */
    @Transactional(readOnly = true)
    public ResponseEntity<List<CommentDto>> getReplies(Long commentId) {
        // verify comment exists
        commentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found with id: " + commentId));

        List<Comment> replies = commentRepository.findRepliesByParentCommentId(commentId);
        List<CommentDto> replyDtos = replies.stream()
                .map(commentMapper::toDTO)
                .sorted((c1, c2) -> c1.createdAt().compareTo(c2.createdAt()))
                .toList();

        return ResponseEntity.ok(replyDtos);
    }

    /**
     * Updates a comment (only the author can update)
     * @param commentId the comment ID
     * @param commentDto the updated comment data
     * @return ResponseEntity with the updated CommentDto
     * @throws ResourceNotFoundException if comment not found
     * @throws UnauthorizedException if user is not the comment author
     * @throws IllegalArgumentException if content is empty
     */
    public ResponseEntity<CommentDto> updateComment(Long commentId, CommentDto commentDto) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found with id: " + commentId));

        AbstractUser currentUser = getCurrentUser();

        // check authorization
        if (!comment.getAuthor().getId().equals(currentUser.getId())) {
            throw new UnauthorizedException("You can only update your own comments");
        }
        comment.setContent(commentDto.content());
        comment.setUpdatedAt(LocalDateTime.now());
        Comment updatedComment = commentRepository.save(comment);
        CommentDto responseDto = commentMapper.toDTO(updatedComment);

        return ResponseEntity.ok(responseDto);
    }

    public ResponseEntity<CommentDto> adminDeleteComment(Long commentId) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found with id: " + commentId));

        commentRepository.delete(comment);
        CommentDto responseDto = commentMapper.toDTO(comment);
        return ResponseEntity.ok(responseDto);
    }

    /**
     * Deletes a comment (only the author can delete)
     * @param commentId the comment ID
     * @return ResponseEntity with the deleted CommentDto
     * @throws ResourceNotFoundException if comment not found
     * @throws UnauthorizedException if user is not the comment author
     */
    public ResponseEntity<CommentDto> deleteComment(Long commentId) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found with id: " + commentId));

        AbstractUser currentUser = getCurrentUser();

        // check authorization, only author can delete
        if (!comment.getAuthor().getId().equals(currentUser.getId())) {
            throw new UnauthorizedException("You can only delete your own comments");
        }

        CommentDto responseDto = commentMapper.toDTO(comment);
        commentRepository.deleteById(commentId);

        return ResponseEntity.ok(responseDto);
    }

    /**
     * Helper method to get the currently authenticated user
     * @return the AbstractUser object
     * @throws UnauthorizedException if user is not authenticated
     */
    private AbstractUser getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null) {
            throw new UnauthorizedException("User not authenticated");
        }

        String username = authentication.getName();

        return userRepository.findByUsername(username)
                .orElseThrow(() -> new UnauthorizedException("User not found"));
    }
}
