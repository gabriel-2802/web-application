package blog.application.demo.services;

import blog.application.demo.dto.request.CreatePostRequest;
import blog.application.demo.dto.response.PostResponse;
import blog.application.demo.entities.Post;
import blog.application.demo.entities.PostCollection;
import blog.application.demo.entities.users.Writer;
import blog.application.demo.exceptions.ResourceNotFoundException;
import blog.application.demo.exceptions.UnauthorizedException;
import blog.application.demo.mappers.PostMapper;
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
public class PostService extends AbstractService{
    private final PostRepository postRepository;
    private final PostCollectionRepository collectionRepository;
    private final PostMapper postMapper;

    public PostService(UserRepository userRepository, PostRepository postRepository, 
                       PostCollectionRepository collectionRepository, PostMapper postMapper) {
        super(userRepository);
        this.postRepository = postRepository;
        this.collectionRepository = collectionRepository;
        this.postMapper = postMapper;
    }

        

    /**
     * Creates a new post for the authenticated writer
     * @param postDto the post data transfer object
     * @return ResponseEntity with the created PostDto
     * @throws IllegalArgumentException if input is invalid
     */
    public ResponseEntity<PostResponse> createPost(CreatePostRequest postDto) {
        Writer author = getCurrentWriter();

        PostCollection collection = null;
        if (postDto.collectionId() != null) {
            collection = collectionRepository.findById(postDto.collectionId())
                    .orElseThrow(() -> new ResourceNotFoundException("Post collection not found with id: " + postDto.collectionId()));
        }

        // Create new post entity with all relationships
        Post post = postMapper.toEntity(postDto, author);
        post.setAuthor(author);
        if (collection != null) {
            post.setCollection(collection);
        }

        // Save only the Post - Hibernate handles the relationships
        Post savedPost = postRepository.save(post);
        PostResponse responseDto = postMapper.toResponse(savedPost);


        return ResponseEntity.status(HttpStatus.CREATED).body(responseDto);
    }

    /**
     * Retrieves all posts
     * @return ResponseEntity with list of all PostDtos
     */
    @Transactional(readOnly = true)
    public ResponseEntity<List<PostResponse>> getAllPosts() {
        List<Post> posts = postRepository.findAll();
        List<PostResponse> postDtos = posts.stream()
                .map(postMapper::toResponse)
                .toList();

        return ResponseEntity.ok(postDtos);
    }

    /**
     * Finds a post by ID
     * @param id the post ID
     * @return ResponseEntity with the PostDto
     * @throws ResourceNotFoundException if post not found
     */
    @Transactional(readOnly = true)
    public ResponseEntity<PostResponse> findPost(int id) {
        Post post = postRepository.findById((long) id)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found with id: " + id));

        PostResponse postDto = postMapper.toResponse(post);
        return ResponseEntity.ok(postDto);
    }

    /**
     * Updates an existing post (only the author can update)
     * @param id the post ID
     * @param postDto the updated post data
     * @return ResponseEntity with the updated PostDto
     * @throws ResourceNotFoundException if post not found
     * @throws UnauthorizedException if user is not the post author
     * @throws IllegalArgumentException if input is invalid
     */
    public ResponseEntity<PostResponse> updatePost(int id, CreatePostRequest postDto) {
        Post post = postRepository.findById((long) id)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found with id: " + id));

        Writer currentWriter = getCurrentWriter();

        if (!post.getAuthor().getId().equals(currentWriter.getId())) {
            throw new UnauthorizedException("You can only update your own posts");
        }


        if (postDto.imageUrl() != null) {
            post.setImageUrl(postDto.imageUrl());
        }

        Post updatedPost = postRepository.save(post);
        PostResponse responseDto = postMapper.toResponse(updatedPost);

        return ResponseEntity.ok(responseDto);
    }

    /**
     * Deletes a post (only the author can delete)
     * @param id the post ID
     * @return ResponseEntity with the deleted PostDto
     * @throws ResourceNotFoundException if post not found
     * @throws UnauthorizedException if user is not the post author
     */
    public ResponseEntity<PostResponse> deletePost(int id) {
        Post post = postRepository.findById((long) id)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found with id: " + id));

        Writer currentWriter = getCurrentWriter();

        // Security: Only author can delete their own post
        if (!post.getAuthor().getId().equals(currentWriter.getId())) {
            throw new UnauthorizedException("You can only delete your own posts");
        }

        PostResponse responseDto = postMapper.toResponse(post);
        postRepository.deleteById((long) id);

        return ResponseEntity.ok(responseDto);
    }

    /**
     * Searches posts by keyword in title and content
     * @param keyword the search keyword
     * @return ResponseEntity with list of matching PostDtos
     * @throws IllegalArgumentException if keyword is empty or null
     */
    @Transactional(readOnly = true)
    public ResponseEntity<List<PostResponse>> searchPosts(String keyword) {
        if (keyword == null || keyword.isBlank()) {
            throw new IllegalArgumentException("Search keyword cannot be empty");
        }

        List<Post> posts = postRepository.searchByKeyword(keyword);
        List<PostResponse> postDtos = posts.stream()
                .map(postMapper::toResponse)
                .toList();

        return ResponseEntity.ok(postDtos);
    }
}
