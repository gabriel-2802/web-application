package blog.application.demo.controllers;

import blog.application.demo.dto.PostDto;
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
    public ResponseEntity<PostDto> createPost(@Valid @RequestBody PostDto postDto) {
        return postService.createPost(postDto);
    }

    @GetMapping("/all")
    public ResponseEntity<List<PostDto>> allPosts() {
        return postService.getAllPosts();
    }

    @GetMapping("/{id}")
    public ResponseEntity<PostDto> getPost(@PathVariable int id) {
        return postService.findPost(id);
    }

    @PutMapping("/update/{id}")
    @PreAuthorize("hasRole('ROLE_WRITER')")
    public ResponseEntity<PostDto> updatePost(@PathVariable int id, @Valid @RequestBody PostDto postDto) {
        return postService.updatePost(id, postDto);
    }

    @DeleteMapping("/delete/{id}")
    @PreAuthorize("hasRole('ROLE_WRITER')")
    public ResponseEntity<PostDto> deletePost(@PathVariable int id) {
        return postService.deletePost(id);
    }

    @GetMapping("/search/{keyword}")
    public ResponseEntity<List<PostDto>> searchPosts(@PathVariable String keyword) {
        return postService.searchPosts(keyword);
    }
}
