package blog.application.demo.services;

import blog.application.demo.dto.CollectionDto;
import blog.application.demo.entities.Post;
import blog.application.demo.entities.PostCollection;
import blog.application.demo.entities.users.Writer;
import blog.application.demo.exceptions.ResourceNotFoundException;
import blog.application.demo.exceptions.UnauthorizedException;
import blog.application.demo.mappers.CollectionMapper;
import blog.application.demo.repositories.PostCollectionRepository;
import blog.application.demo.repositories.PostRepository;
import blog.application.demo.repositories.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class CollectionService extends AbstractService{
    private final PostCollectionRepository collectionRepository;
    private final PostRepository postRepository;
    private final CollectionMapper collectionMapper;

    public CollectionService(UserRepository userRepository, PostCollectionRepository collectionRepository,
                             PostRepository postRepository, CollectionMapper collectionMapper) {
        super(userRepository);
        this.collectionRepository = collectionRepository;
        this.postRepository = postRepository;
        this.collectionMapper = collectionMapper;
    }

    /**
     * Creates a new collection for the authenticated writer
     * @param collectionDto the collection data
     * @return ResponseEntity with the created CollectionDto
     * @throws IllegalArgumentException if input is invalid
     */
    public ResponseEntity<CollectionDto> create(CollectionDto collectionDto) {
        Writer owner = getCurrentWriter();

        // create new collection entity
        PostCollection collection = collectionMapper.toEntity(collectionDto, owner);
        PostCollection savedCollection = collectionRepository.save(collection);
        CollectionDto responseDto = collectionMapper.toDTO(savedCollection);

        return ResponseEntity.status(HttpStatus.CREATED).body(responseDto);
    }

    /**
     * Retrieves all collections
     * @return ResponseEntity with list of all CollectionDtos
     */
    @Transactional(readOnly = true)
    public ResponseEntity<List<CollectionDto>> getAll() {
        List<PostCollection> collections = collectionRepository.findAll();
        List<CollectionDto> collectionDtos = collections.stream()
                .map(collectionMapper::toDTO)
                .toList();

        return ResponseEntity.ok(collectionDtos);
    }

    /**
     * Retrieves a specific collection by ID
     * @param id the collection ID
     * @return ResponseEntity with the CollectionDto
     * @throws ResourceNotFoundException if collection not found
     */
    @Transactional(readOnly = true)
    public ResponseEntity<CollectionDto> getCollection(int id) {
        PostCollection collection = collectionRepository.findById((long) id)
                .orElseThrow(() -> new ResourceNotFoundException("Collection not found with id: " + id));

        CollectionDto collectionDto = collectionMapper.toDTO(collection);
        return ResponseEntity.ok(collectionDto);
    }

    /**
     * Updates an existing collection (owner only)
     * @param id the collection ID
     * @param collectionDto the updated collection data
     * @return ResponseEntity with the updated CollectionDto
     * @throws ResourceNotFoundException if collection not found
     * @throws UnauthorizedException if user is not the collection owner
     */
    public ResponseEntity<CollectionDto> updateCollection(int id, CollectionDto collectionDto) {
        PostCollection collection = collectionRepository.findById((long) id)
                .orElseThrow(() -> new ResourceNotFoundException("Collection not found with id: " + id));

        Writer currentWriter = getCurrentWriter();

        if (!collection.getOwner().getId().equals(currentWriter.getId())) {
            throw new UnauthorizedException("You can only update your own collections");
        }

        collection.setDescription(collectionDto.description());
        collection.setName(collectionDto.name());

        PostCollection updatedCollection = collectionRepository.save(collection);
        CollectionDto responseDto = collectionMapper.toDTO(updatedCollection);

        return ResponseEntity.ok(responseDto);
    }

    /**
     * Pins/unpins a collection (owner only)
     * @param id the collection ID
     * @return ResponseEntity with the updated CollectionDto
     * @throws ResourceNotFoundException if collection not found
     * @throws UnauthorizedException if user is not the collection owner
     */
    public ResponseEntity<CollectionDto> pinCollection(int id) {
        PostCollection collection = collectionRepository.findById((long) id)
                .orElseThrow(() -> new ResourceNotFoundException("Collection not found with id: " + id));

        Writer currentWriter = getCurrentWriter();

        // security: only owner can pin
        if (!collection.getOwner().getId().equals(currentWriter.getId())) {
            throw new UnauthorizedException("You can only pin your own collections");
        }

        // toggle pin status
        collection.setPinned(!collection.isPinned());
        PostCollection updatedCollection = collectionRepository.save(collection);
        CollectionDto responseDto = collectionMapper.toDTO(updatedCollection);

        return ResponseEntity.ok(responseDto);
    }

    /**
     * Adds posts to a collection (owner only)
     * @param postIds list of post IDs to add
     * @param id the collection ID
     * @return ResponseEntity with the updated CollectionDto
     * @throws ResourceNotFoundException if collection or post not found
     * @throws UnauthorizedException if user is not the collection owner
     * @throws IllegalArgumentException if post list is empty
     */
    @Transactional
    public ResponseEntity<CollectionDto> addPosts(List<Integer> postIds, int id) {
        if (postIds == null || postIds.isEmpty()) {
            throw new IllegalArgumentException("Post IDs list cannot be empty");
        }

        PostCollection collection = collectionRepository.findById((long) id)
                .orElseThrow(() -> new ResourceNotFoundException("Collection not found with id: " + id));

        Writer currentWriter = getCurrentWriter();

        if (!collection.getOwner().getId().equals(currentWriter.getId())) {
            throw new UnauthorizedException("You can only add posts to your own collections");
        }

        for (var postId : postIds) {
            Post post = postRepository.findById((long) postId)
                    .orElseThrow(() -> new ResourceNotFoundException("Post not found with id: " + postId));

            if (post.getCollection() == null || !post.getCollection().getId().equals(collection.getId())) {
                post.setCollection(collection);
                postRepository.save(post);
            }
        }

        // force fresh fetch bypassing cache
        PostCollection updatedCollection = collectionRepository.findByIdWithPosts((long) id)
                .orElseThrow(() -> new ResourceNotFoundException("Collection not found"));

        return ResponseEntity.ok(collectionMapper.toDTO(updatedCollection));
    }

    /**
     * Removes posts from a collection (owner only)
     * @param postIds list of post IDs to remove
     * @param id the collection ID
     * @return ResponseEntity with the updated CollectionDto
     * @throws ResourceNotFoundException if collection or post not found
     * @throws UnauthorizedException if user is not the collection owner
     * @throws IllegalArgumentException if post list is empty
     */
    public ResponseEntity<CollectionDto> removePosts(List<Integer> postIds, int id) {
        if (postIds == null || postIds.isEmpty()) {
            throw new IllegalArgumentException("Post IDs list cannot be empty");
        }

        PostCollection collection = collectionRepository.findById((long) id)
                .orElseThrow(() -> new ResourceNotFoundException("Collection not found with id: " + id));

        Writer currentWriter = getCurrentWriter();

        // security: only owner can remove posts
        if (!collection.getOwner().getId().equals(currentWriter.getId())) {
            throw new UnauthorizedException("You can only remove posts from your own collections");
        }

        // remove posts from collection
        for (var postId : postIds) {
            Post post = postRepository.findById((long) postId)
                    .orElseThrow(() -> new ResourceNotFoundException("Post not found with id: " + postId));

            if (post.getCollection() != null && post.getCollection().getId().equals(collection.getId())) {
                post.setCollection(null);
                postRepository.save(post);
            }
        }

        PostCollection updatedCollection = collectionRepository.findByIdWithPosts((long) id)
                .orElseThrow(() -> new ResourceNotFoundException("Collection not found"));

        return ResponseEntity.ok(collectionMapper.toDTO(updatedCollection));
    }

    /**
     * Deletes a collection (owner only)
     * @param id the collection ID
     * @return ResponseEntity with the deleted CollectionDto
     * @throws ResourceNotFoundException if collection not found
     * @throws UnauthorizedException if user is not the collection owner
     */
    public ResponseEntity<CollectionDto> delete(int id) {
        PostCollection collection = collectionRepository.findById((long) id)
                .orElseThrow(() -> new ResourceNotFoundException("Collection not found with id: " + id));

        Writer currentWriter = getCurrentWriter();

        // security: only owner can delete
        if (!collection.getOwner().getId().equals(currentWriter.getId())) {
            throw new UnauthorizedException("You can only delete your own collections");
        }

        CollectionDto responseDto = collectionMapper.toDTO(collection);

        // nullify all posts in collection before deletion
        collectionRepository.nullifyPostCollections(collection.getId());

        collectionRepository.deleteById((long) id);

        return ResponseEntity.ok(responseDto);
    }
}
