package blog.application.demo.services;

import blog.application.demo.dto.request.CreateFeedbackRequest;
import blog.application.demo.dto.response.FeedbackResponse;
import blog.application.demo.entities.Feedback;
import blog.application.demo.mappers.FeedbackMapper;
import blog.application.demo.repositories.FeedbackRepository;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
public class FeedbackService {
    private final FeedbackRepository feedbackRepository;
    private final FeedbackMapper feedbackMapper;
    
    public ResponseEntity<FeedbackResponse> createFeedback(CreateFeedbackRequest request) {
        Feedback feedback = feedbackMapper.toEntity(request);
        Feedback savedFeedback = feedbackRepository.save(feedback);
        return ResponseEntity.ok(feedbackMapper.toResponse(savedFeedback));
    }
    
    public ResponseEntity<List<FeedbackResponse>> getAllFeedback() {
        List<Feedback> feedbackList = feedbackRepository.findAll();
        List<FeedbackResponse> responseList = feedbackList.stream()
            .map(feedbackMapper::toResponse)
            .collect(Collectors.toList());
        return ResponseEntity.ok(responseList);
    }
    
    public ResponseEntity<Void> deleteFeedback(Long id) {
        if (!feedbackRepository.existsById(id)) {
            throw new RuntimeException("Feedback not found with id: " + id);
        }
        feedbackRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}


