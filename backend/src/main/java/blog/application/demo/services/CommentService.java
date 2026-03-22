package blog.application.demo.services;

import blog.application.demo.dto.request.CreateCommentRequest;
import blog.application.demo.dto.response.CommentResponse;
import blog.application.demo.entities.Comment;
import blog.application.demo.entities.Post;
import blog.application.demo.entities.users.AbstractUser;
import blog.application.demo.exceptions.ResourceNotFoundException;
import blog.application.demo.exceptions.UnauthorizedException;
import blog.application.demo.mappers.CommentMapper;
import blog.application.demo.repositories.CommentRepository;
import blog.application.demo.repositories.PostRepository;
import blog.application.demo.repositories.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class CommentService extends AbstractService {
    private final CommentRepository commentRepository;
    private final PostRepository postRepository;
    private final CommentMapper commentMapper;

    public CommentService(UserRepository uRepo, CommentRepository cRepo, PostRepository pRepo, CommentMapper cMapper) {
        super(uRepo);
        commentRepository = cRepo;
        postRepository = pRepo;
        commentMapper = cMapper;
    }

    /**
     * Creates a new comment on a post
     * @param commentDto the comment data
     * @return ResponseEntity with the created CommentDto
     * @throws ResourceNotFoundException if post not found
     * @throws IllegalArgumentException if content is empty
     */
    public ResponseEntity<CommentResponse> createComment(CreateCommentRequest commentDto) {
        Post post = postRepository.findById(commentDto.postId())
                .orElseThrow(() -> new ResourceNotFoundException("Post not found with id: " + commentDto.postId()));

        Comment parentComment = null;
        if (commentDto.parentCommentId() != null) {
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

        Comment comment = commentMapper.toEntity(commentDto, author, post, parentComment);

        Comment savedComment = commentRepository.save(comment);
        CommentResponse responseDto = commentMapper.toResponse(savedComment);

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
    public ResponseEntity<List<CommentResponse>> getCommentsByPost(Long postId) {
        // verify post exists
        postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found with id: " + postId));

        List<Comment> comments = commentRepository.findByPostId(postId);
        List<CommentResponse> commentDtos = comments.stream()
                .map(commentMapper::toResponse)
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
    public ResponseEntity<List<CommentResponse>> getTopLevelComments(Long postId) {
        // Verify post exists
        postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found with id: " + postId));

        List<Comment> comments = commentRepository.findTopLevelCommentsByPostId(postId);
        List<CommentResponse> commentDtos = comments.stream()
                .map(commentMapper::toResponse)
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
    public ResponseEntity<List<CommentResponse>> getReplies(Long commentId) {
        // verify comment exists
        commentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found with id: " + commentId));

        List<Comment> replies = commentRepository.findRepliesByParentCommentId(commentId);
        List<CommentResponse> replyDtos = replies.stream()
                .map(commentMapper::toResponse)
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
    public ResponseEntity<CommentResponse> updateComment(Long commentId, CreateCommentRequest commentDto) {
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
        CommentResponse responseDto = commentMapper.toResponse(updatedComment);

        return ResponseEntity.ok(responseDto);
    }

    public ResponseEntity<CommentResponse> adminDeleteComment(Long commentId) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found with id: " + commentId));

        commentRepository.delete(comment);
        CommentResponse responseDto = commentMapper.toResponse(comment);
        return ResponseEntity.ok(responseDto);
    }

    /**
     * Deletes a comment (only the author can delete)
     * 
     * When a comment is deleted, its child comments are promoted:
     * - If the deleted comment is top-level (parent = NULL), children become top-level
     * - If the deleted comment is a reply, children become replies to the deleted comment's parent
     * 
     * @param commentId the comment ID
     * @return ResponseEntity with the deleted comment response
     * @throws ResourceNotFoundException if comment not found
     * @throws UnauthorizedException if user is not the comment author
     */
    public ResponseEntity<CommentResponse> deleteComment(Long commentId) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found with id: " + commentId));

        AbstractUser currentUser = getCurrentUser();

        // check authorization, only author can delete
        if (!comment.getAuthor().getId().equals(currentUser.getId())) {
            throw new UnauthorizedException("You can only delete your own comments");
        }

        // get the parent of the comment being deleted (could be null if top-level)
        Comment parentOfDeleted = comment.getParent();

        // find all direct replies to this comment
        List<Comment> childComments = commentRepository.findRepliesByParentCommentId(commentId);

        // promote all child comments to parent's level
        for (Comment child : childComments) {
            child.setParent(parentOfDeleted);
            child.setUpdatedAt(LocalDateTime.now());
            commentRepository.save(child);
        }

        // create response before deletion
        CommentResponse responseDto = commentMapper.toResponse(comment);

        // delete the comment
        commentRepository.deleteById(commentId);

        return ResponseEntity.ok(responseDto);
    }
}
