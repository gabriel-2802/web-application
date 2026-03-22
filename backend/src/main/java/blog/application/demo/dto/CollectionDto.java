package blog.application.demo.dto;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import java.time.LocalDateTime;
import java.util.List;

public record CollectionDto(
        Long id,
        @NotNull @NotBlank
        String name,
        @NotNull @NotBlank
        String description,
        String owner,
        String ownerId,
        @NotNull
        Boolean pinned,
        LocalDateTime createAt,
        List<PostDto> posts) {
}
