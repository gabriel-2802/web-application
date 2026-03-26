package blog.application.demo.mappers;

import blog.application.demo.dto.request.CreateFeedbackRequest;
import blog.application.demo.dto.response.FeedbackResponse;
import blog.application.demo.entities.Feedback;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface FeedbackMapper {
    
    Feedback toEntity(CreateFeedbackRequest request);
    
    FeedbackResponse toResponse(Feedback feedback);
}

