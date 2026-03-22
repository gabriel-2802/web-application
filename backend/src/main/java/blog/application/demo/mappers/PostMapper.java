package blog.application.demo.mappers;

import blog.application.demo.dto.PostDto;
import blog.application.demo.entities.Post;
import blog.application.demo.entities.users.Writer;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Date;

@Mapper(componentModel = "spring", uses = {CommentMapper.class})
public interface PostMapper {

    @Mapping(target = "authorId", source = "author.id")
    @Mapping(target = "authorUsername", source = "author.username")
    @Mapping(target = "collectionId", source = "collection.id")
    PostDto toDTO(Post post);

    default Post toEntity(PostDto postDTO, Writer author) {
        if (postDTO == null) {
            return null;
        }

        Post post = new Post();
        post.setId(null);
        post.setTitle(postDTO.title());
        post.setContent(postDTO.content());
        post.setImageUrl(postDTO.imageUrl());
        post.setCollection(null);
        post.setComments(new ArrayList<>());
        post.setCreatedAt(LocalDateTime.now());
        post.setUpdatedAt(LocalDateTime.now());

        return post;
    }
}
