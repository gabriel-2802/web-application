package blog.application.demo.mappers;

import blog.application.demo.dto.request.CreateCollectionRequest;
import blog.application.demo.dto.response.CollectionResponse;
import blog.application.demo.entities.PostCollection;
import blog.application.demo.entities.users.Writer;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.ArrayList;

@Mapper(componentModel = "spring", uses = {PostMapper.class})
public interface CollectionMapper {

    @Mapping(target = "owner", source = "owner.username")
    @Mapping(target = "ownerId", expression = "java(collection.getOwner().getId().toString())")
    @Mapping(target = "posts", source = "posts")
    @Mapping(target = "createdAt", source = "createdAt")
    CollectionResponse toResponse(PostCollection collection);

    default PostCollection toEntity(CreateCollectionRequest createCollectionRequest, Writer owner) {
        PostCollection collection = new PostCollection();
        collection.setId(null);
        collection.setName(createCollectionRequest.name());
        collection.setDescription(createCollectionRequest.description());
        collection.setOwner(owner);
        collection.setPinned(createCollectionRequest.pinned() != null ? createCollectionRequest.pinned() : false);
        collection.setPosts(new ArrayList<>());
        return collection;
    }
}