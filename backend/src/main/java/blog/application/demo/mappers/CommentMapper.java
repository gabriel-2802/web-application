package blog.application.demo.mappers;

import blog.application.demo.dto.CommentDto;
import blog.application.demo.entities.Comment;
import blog.application.demo.entities.Post;
import blog.application.demo.entities.users.AbstractUser;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.ArrayList;

@Mapper(componentModel = "spring")
public interface CommentMapper {

    @Mapping(target = "authorId", source = "author.id")
    @Mapping(target = "authorUsername", source = "author.username")
    @Mapping(target = "postId", source = "post.id")
    @Mapping(target = "parentCommentId", source = "parent.id")
    @Mapping(target = "isChildComment", expression = "java(comment.getParent() != null)")
    @Mapping(target = "hasReplies", expression = "java(comment.getReplies() != null && !comment.getReplies().isEmpty())")
    @Mapping(target = "replies", source = "replies")
    CommentDto toDTO(Comment comment);

    default Comment toEntity(CommentDto commentDTO) {
        Comment comment = new Comment();
        comment.setContent(commentDTO.content());
        comment.setReplies(new ArrayList<>());
        return comment;
    }

    default Comment toEntity(CommentDto commentDTO, AbstractUser author, Post post, Comment parent) {
        if (commentDTO == null) {
            return null;
        }

        Comment comment = new Comment();
        comment.setId(null); // New entity, no ID
        comment.setContent(commentDTO.content());
        comment.setAuthor(author);
        comment.setPost(post);
        comment.setParent(parent); // null for top-level comments, set for replies
        comment.setReplies(new ArrayList<>()); // Initialize empty replies list
        comment.setCreatedAt(null); // Set by @PrePersist
        comment.setUpdatedAt(null); // Set by @PrePersist and @PreUpdate

        return comment;
    }
}

