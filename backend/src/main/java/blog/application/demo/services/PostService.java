package blog.application.demo.services;

import blog.application.demo.dto.PostDto;
import blog.application.demo.entities.Post;
import blog.application.demo.entities.PostCollection;
import blog.application.demo.entities.users.Writer;
import blog.application.demo.exceptions.ResourceNotFoundException;
import blog.application.demo.exceptions.UnauthorizedException;
import blog.application.demo.mappers.PostMapper;
import blog.application.demo.repositories.PostCollectionRepository;
import blog.application.demo.repositories.PostRepository;
import blog.application.demo.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class PostService {
    private final PostRepository postRepository;
    private final PostCollectionRepository collectionRepository;
    private final PostMapper postMapper;
    private final UserRepository userRepository;

    /**
     * Creates a new post for the authenticated writer
     * @param postDto the post data transfer object
     * @return ResponseEntity with the created PostDto
     * @throws IllegalArgumentException if input is invalid
     */
    public ResponseEntity<PostDto> createPost(PostDto postDto) {
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
        PostDto responseDto = postMapper.toDTO(savedPost);


        return ResponseEntity.status(HttpStatus.CREATED).body(responseDto);
    }

    /**
     * Retrieves all posts
     * @return ResponseEntity with list of all PostDtos
     */
    @Transactional(readOnly = true)
    public ResponseEntity<List<PostDto>> getAllPosts() {
        List<Post> posts = postRepository.findAll();
        List<PostDto> postDtos = posts.stream()
                .map(postMapper::toDTO)
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
    public ResponseEntity<PostDto> findPost(int id) {
        Post post = postRepository.findById((long) id)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found with id: " + id));

        PostDto postDto = postMapper.toDTO(post);
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
    public ResponseEntity<PostDto> updatePost(int id, PostDto postDto) {
        Post post = postRepository.findById((long) id)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found with id: " + id));

        Writer currentWriter = getCurrentWriter();

        if (!post.getAuthor().getId().equals(currentWriter.getId())) {
            throw new UnauthorizedException("You can only update your own posts");
        }

        // validate input
        if (postDto.title() != null && !postDto.title().isBlank()) {
            post.setTitle(postDto.title());
        }
        if (postDto.content() != null && !postDto.content().isBlank()) {
            post.setContent(postDto.content());
        }
        if (postDto.imageUrl() != null) {
            post.setImageUrl(postDto.imageUrl());
        }

        Post updatedPost = postRepository.save(post);
        PostDto responseDto = postMapper.toDTO(updatedPost);

        return ResponseEntity.ok(responseDto);
    }

    /**
     * Deletes a post (only the author can delete)
     * @param id the post ID
     * @return ResponseEntity with the deleted PostDto
     * @throws ResourceNotFoundException if post not found
     * @throws UnauthorizedException if user is not the post author
     */
    public ResponseEntity<PostDto> deletePost(int id) {
        Post post = postRepository.findById((long) id)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found with id: " + id));

        Writer currentWriter = getCurrentWriter();

        // Security: Only author can delete their own post
        if (!post.getAuthor().getId().equals(currentWriter.getId())) {
            throw new UnauthorizedException("You can only delete your own posts");
        }

        PostDto responseDto = postMapper.toDTO(post);
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
    public ResponseEntity<List<PostDto>> searchPosts(String keyword) {
        if (keyword == null || keyword.isBlank()) {
            throw new IllegalArgumentException("Search keyword cannot be empty");
        }

        List<Post> posts = postRepository.searchByKeyword(keyword);
        List<PostDto> postDtos = posts.stream()
                .map(postMapper::toDTO)
                .toList();

        return ResponseEntity.ok(postDtos);
    }

    /**
     * Helper method to get the currently authenticated Writer
     * @return the Writer object
     * @throws UnauthorizedException if user is not authenticated or not a Writer
     */
    private Writer getCurrentWriter() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        
        if (authentication == null) {
            throw new UnauthorizedException("User not authenticated");
        }
        
        String username = authentication.getName();
        
        if (username == null || username.isBlank()) {
            throw new UnauthorizedException("Invalid authentication credentials");
        }
        
        return userRepository.findByUsername(username)
                .filter(user -> user instanceof Writer)
                .map(user -> (Writer) user)
                .orElseThrow(() -> new UnauthorizedException("User not found or is not a Writer"));
    }
}
