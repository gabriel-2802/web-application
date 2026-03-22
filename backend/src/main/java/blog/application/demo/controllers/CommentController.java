package blog.application.demo.controllers;

import blog.application.demo.dto.request.CreateCommentRequest;
import blog.application.demo.dto.response.CommentResponse;
import blog.application.demo.services.CommentService;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/comments")
@AllArgsConstructor
public class CommentController {
    private final CommentService commentService;

    @PostMapping("/create")
    @PreAuthorize("hasAnyRole('ROLE_VIEWER', 'ROLE_WRITER')")
    public ResponseEntity<CommentResponse> createComment(@Valid @RequestBody CreateCommentRequest createCommentRequest) {
        return commentService.createComment(createCommentRequest);
    }

    @GetMapping("/{id}")
    public ResponseEntity<List<CommentResponse>> getCommentsByPost(@PathVariable int id) {
        return commentService.getTopLevelComments((long) id);
    }

    @GetMapping("/replies/{commentId}")
    public ResponseEntity<List<CommentResponse>> getReplies(@Valid @PathVariable int commentId) {
        return commentService.getReplies((long)commentId);
    }

    @GetMapping("/top/{postId}")
    public ResponseEntity<List<CommentResponse>> getTopLevelComments(@Valid @PathVariable int postId) {
        return commentService.getTopLevelComments((long)postId);
    }

    @PutMapping("/update/{id}")
    @PreAuthorize("hasAnyRole('ROLE_VIEWER', 'ROLE_WRITER')")
    public ResponseEntity<CommentResponse> updateComment(@PathVariable int id, @Valid @RequestBody CreateCommentRequest createCommentRequest) {
        return commentService.updateComment((long)id, createCommentRequest);
    }

    @DeleteMapping("/delete/{id}")
    @PreAuthorize("hasAnyRole('ROLE_VIEWER', 'ROLE_WRITER')")
    public ResponseEntity<CommentResponse> deleteComment(@PathVariable int id) {
        return commentService.deleteComment((long) id);
    }

    @DeleteMapping("/admin/delete/{id}")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<CommentResponse> adminDeleteComment(@PathVariable int id) {
        return commentService.deleteComment((long) id);
    }
}
