package blog.application.demo.mappers;

import blog.application.demo.dto.request.CreatePostRequest;
import blog.application.demo.dto.response.PostResponse;
import blog.application.demo.entities.Post;
import blog.application.demo.entities.users.Writer;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.time.LocalDateTime;
import java.util.ArrayList;

@Mapper(componentModel = "spring", uses = {CommentMapper.class})
public interface PostMapper {

    @Mapping(target = "authorId", source = "author.id")
    @Mapping(target = "authorUsername", source = "author.username")
    @Mapping(target = "collectionId", source = "collection.id")
    PostResponse toResponse(Post post);

    default Post toEntity(CreatePostRequest createPostRequest, Writer author) {
        if (createPostRequest == null) {
            return null;
        }

        Post post = new Post();
        post.setId(null);
        post.setTitle(createPostRequest.title());
        post.setContent(createPostRequest.content());
        post.setImageUrl(createPostRequest.imageUrl());
        post.setCollection(null);
        post.setComments(new ArrayList<>());
        post.setCreatedAt(LocalDateTime.now());
        post.setUpdatedAt(LocalDateTime.now());

        return post;
    }
}
