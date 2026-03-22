package blog.application.demo.mappers;

import blog.application.demo.dto.request.CreateCommentRequest;
import blog.application.demo.dto.response.CommentResponse;
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
    CommentResponse toResponse(Comment comment);

    default Comment toEntity(CreateCommentRequest createCommentRequest) {
        Comment comment = new Comment();
        comment.setContent(createCommentRequest.content());
        comment.setReplies(new ArrayList<>());
        return comment;
    }

    default Comment toEntity(CreateCommentRequest createCommentRequest, AbstractUser author, Post post, Comment parent) {
        if (createCommentRequest == null) {
            return null;
        }

        Comment comment = new Comment();
        comment.setId(null);
        comment.setContent(createCommentRequest.content());
        comment.setAuthor(author);
        comment.setPost(post);
        comment.setParent(parent);
        comment.setReplies(new ArrayList<>());
        comment.setCreatedAt(null);
        comment.setUpdatedAt(null);

        return comment;
    }
}

