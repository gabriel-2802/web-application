package blog.application.demo.controllers;

import blog.application.demo.dto.request.CreateCollectionRequest;
import blog.application.demo.dto.response.CollectionResponse;
import blog.application.demo.services.CollectionService;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/collections")
@AllArgsConstructor
public class CollectionController {
    private final CollectionService collectionService;

    @PostMapping("/create")
    @PreAuthorize("hasAnyAuthority('WRITER')")
    public ResponseEntity<CollectionResponse> createCollection(@Valid @RequestBody CreateCollectionRequest createCollectionRequest) {
        return collectionService.create(createCollectionRequest);
    }

    @GetMapping("/all")
    public ResponseEntity<List<CollectionResponse>> getAllCollections() {
        return collectionService.getAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<CollectionResponse> getCollection(@PathVariable int id) {
        return collectionService.getCollection(id);
    }

    @PutMapping("/update/{id}")
    @PreAuthorize("hasAnyAuthority('WRITER')")
    public ResponseEntity<CollectionResponse> updateCollection(@PathVariable int id, @Valid @RequestBody CreateCollectionRequest createCollectionRequest) {
        return collectionService.updateCollection(id, createCollectionRequest);
    }

    @PutMapping("/pin/{id}")
    @PreAuthorize("hasAnyAuthority('WRITER')")
    public ResponseEntity<CollectionResponse> pinCollection(@PathVariable int id) {
        return collectionService.pinCollection(id);
    }

    @PutMapping("add/{id}/posts")
    @PreAuthorize("hasAnyAuthority('WRITER')")
    public ResponseEntity<CollectionResponse> addPostsToCollection(@RequestParam List<Integer> postIds, @PathVariable int id) {
        return collectionService.addPosts(postIds, id);
    }

    @PutMapping("remove/{id}/posts")
    @PreAuthorize("hasAnyAuthority('WRITER')")
    public ResponseEntity<CollectionResponse> removePostsFromCollection(@RequestParam List<Integer> postIds, @PathVariable int id) {
        return collectionService.removePosts(postIds, id);
    }

    @DeleteMapping("/delete/{id}")
    @PreAuthorize("hasAnyAuthority('WRITER')")
    public ResponseEntity<CollectionResponse> deleteCollection(@PathVariable int id) {
        return collectionService.delete(id);
    }

}
