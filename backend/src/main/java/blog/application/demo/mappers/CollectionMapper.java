package blog.application.demo.mappers;

import blog.application.demo.dto.CollectionDto;
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
    CollectionDto toDTO(PostCollection collection);

    default PostCollection toEntity(CollectionDto collectionDTO, Writer owner) {
        PostCollection collection = new PostCollection();
        collection.setId(null);
        collection.setName(collectionDTO.name());
        collection.setDescription(collectionDTO.description());
        collection.setOwner(owner);
        collection.setPinned(collectionDTO.pinned());
        collection.setPosts(new ArrayList<>());
        return collection;
    }
}