package blog.application.demo.controllers;

import blog.application.demo.dto.CollectionDto;
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
    public ResponseEntity<CollectionDto> createCollection(@Valid @RequestBody CollectionDto createCollectionDto) {
        return collectionService.create(createCollectionDto);
    }


    @GetMapping("/all")
    public ResponseEntity<List<CollectionDto>> getAllCollections() {
        return collectionService.getAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<CollectionDto> getCollection(@PathVariable int id) {
        return collectionService.getCollection(id);
    }

    @PutMapping("/update/{id}")
    @PreAuthorize("hasAnyAuthority('WRITER')")
    public ResponseEntity<CollectionDto> updateCollection(@PathVariable int id, @Valid @RequestBody CollectionDto collectionDto) {
        return collectionService.updateCollection(id, collectionDto);
    }

    @PutMapping("/pin/{id}")
    @PreAuthorize("hasAnyAuthority('WRITER')")
    public ResponseEntity<CollectionDto> pinCollection(@PathVariable int id) {
        return collectionService.pinCollection(id);
    }

    @PutMapping("add/{id}/posts")
    @PreAuthorize("hasAnyAuthority('WRITER')")
    public ResponseEntity<CollectionDto> addPostsToCollection(@RequestParam List<Integer> postIds, @PathVariable int id) {
        return collectionService.addPosts(postIds, id);
    }

    @PutMapping("remove/{id}/posts")
    @PreAuthorize("hasAnyAuthority('WRITER')")
    public ResponseEntity<CollectionDto> removePostsFromCollection(@RequestParam List<Integer> postIds, @PathVariable int id) {
        return collectionService.removePosts(postIds, id);
    }

    @DeleteMapping("/delete/{id}")
    @PreAuthorize("hasAnyAuthority('WRITER')")
    public ResponseEntity<CollectionDto> deleteCollection(@PathVariable int id) {
        return collectionService.delete(id);
    }




}
