package blog.application.demo.controllers;

import blog.application.demo.dto.request.CreatePostRequest;
import blog.application.demo.dto.response.PostResponse;
import blog.application.demo.services.PostService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/posts")
public class PostController {
    private final PostService postService;

    @PostMapping("/create")
    @PreAuthorize("hasRole('ROLE_WRITER')")
    public ResponseEntity<PostResponse> createPost(@Valid @RequestBody CreatePostRequest createPostRequest) {
        return postService.createPost(createPostRequest);
    }

    @GetMapping("/all")
    public ResponseEntity<List<PostResponse>> allPosts() {
        return postService.getAllPosts();
    }

    @GetMapping("/{id}")
    public ResponseEntity<PostResponse> getPost(@PathVariable int id) {
        return postService.findPost(id);
    }

    @PutMapping("/update/{id}")
    @PreAuthorize("hasRole('ROLE_WRITER')")
    public ResponseEntity<PostResponse> updatePost(@PathVariable int id, @Valid @RequestBody CreatePostRequest createPostRequest) {
        return postService.updatePost(id, createPostRequest);
    }

    @DeleteMapping("/delete/{id}")
    @PreAuthorize("hasRole('ROLE_WRITER')")
    public ResponseEntity<PostResponse> deletePost(@PathVariable int id) {
        return postService.deletePost(id);
    }

    @GetMapping("/search/{keyword}")
    public ResponseEntity<List<PostResponse>> searchPosts(@PathVariable String keyword) {
        return postService.searchPosts(keyword);
    }
}
