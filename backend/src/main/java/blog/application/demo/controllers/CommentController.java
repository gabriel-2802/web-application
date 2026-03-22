package blog.application.demo.controllers;

import blog.application.demo.dto.CommentDto;
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
    public ResponseEntity<CommentDto> createComment( @Valid @RequestBody CommentDto commentDto) {
        return commentService.createComment(commentDto);
    }

    @GetMapping("/{id}")
    public ResponseEntity<List<CommentDto>> getCommentsByPost(@PathVariable int id) {
        return commentService.getTopLevelComments((long) id);
    }

    @GetMapping("/replies/{commentId}")
    public ResponseEntity<List<CommentDto>> getReplies(@Valid @PathVariable int commentId) {
        return commentService.getReplies((long)commentId);
    }

    @GetMapping("/top/{postId}")
    public ResponseEntity<List<CommentDto>> getTopLevelComments(@Valid @PathVariable int postId) {
        return commentService.getTopLevelComments((long)postId);
    }

    @PutMapping("/update/{id}")
    @PreAuthorize("hasAnyRole('ROLE_VIEWER', 'ROLE_WRITER')")
    public ResponseEntity<CommentDto> updateComment(@PathVariable int id, @Valid @RequestBody CommentDto commentDto) {
        return commentService.updateComment((long)id, commentDto);
    }

    @DeleteMapping("/delete/{id}")
    @PreAuthorize("hasAnyRole('ROLE_VIEWER', 'ROLE_WRITER')")
    public ResponseEntity<CommentDto> deleteComment(@PathVariable int id) {
        return commentService.deleteComment((long) id);
    }

    @DeleteMapping("/admin/delete/{id}")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<CommentDto> adminDeleteComment(@PathVariable int id) {
        return commentService.deleteComment((long) id);
    }
}
